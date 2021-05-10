/*
	
	********************
	*** Initializing ***
	********************

	- npm init

	****************
	*** Packages ***
	****************

	- Venom: npm i --save venom-bot
	- FS e Mime: npm install file-system --save

	*******************
	*** Fixing Bugs ***
	*******************

	- npm audit
	- npm audit fix --force
*/

const venom = require('venom-bot');  // bot and scrapper ("headless" function is activated and the Google Chrome Driver Browser is integrated already)
const fs = require('fs'); // used to find and download files
const mime = require('mime-types');  // used to identify file formats and file codecs

/*
	**************
	*** Consts ***
	**************
*/

const QR_CODE_FOLDER = 'assets/qr-codes/';
const TEMP_FILES_FOLDER = 'assets/files/';

/*
	**************
	*** Phones ***
	************** 
*/
var sessions = ['fx-sistemas'];

// fx-sistemas
venom.create(
		sessions[0],
    	(base64Qr, asciiQR, attempts, urlCode) => { downloadQRCode(sessions[0], true, base64Qr, asciiQR); },
   		undefined,
    	{ logQR: false }
	)
	.then((client) => { start(client); })
	.catch((error) => { console.log(error); });

/*
	*****************
	*** Functions ***
	*****************
*/

function downloadQRCode(session, print_qr_code, base64Qr, asciiQR) {
	/*
		- Download the 'qr code' provided by WhatsApp Web inside a local folder
		- Asymptotic: O(1)
	*/


	if (print_qr_code) { console.log(asciiQR); }

	// catch qr code in base 64 format
    var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/), response = {};
    
    /*
		if 'matches' array doesn't have the three qr code identifiers, the code will return an error message. Elements:

		\ matches[0] >> file's base 64 identifier >> useless in the algorithm
		\ matches[1] >> qr code format provided by WhatsApp
		\ matches[2] >> qr code's binary datas
    */
    if (matches.length !== 3) { return new Error('Error to find QR Code.'); }

    // else, the qr code is downloaded into 'qr-codes' folder
    else {
	    response.type = matches[1];
	    response.data = new Buffer.from(matches[2], 'base64');

	    var imageBuffer = response;

	    fs.writeFile(QR_CODE_FOLDER + session + '.png',
	    			imageBuffer['data'],
	        		'binary',
	        		function (error) { if (error != null) { console.log(error); } }
	    );
	}
}

function start(client) {
	/*
		- Session's Initialization, it'll receive the messages and call bot's functions
		- Asymptotic: O(n), being 'n' the amount of messages received in the session
	*/

	client.onMessage(async (message) => {

		// message don't from a group
		if (!(message.isGroupMsg)) {

			// text message
			if (!(message.isMedia)) { getTextMessage(client, message); }

			// file message (image, video, audio, sticker...)
			else { downloadMedia(client, message); }
		}

		// message from a group (check if it's needed)
		else {  }
	});
}

function getTextMessage(client, message) {

	if (message.body.includes('Hi')) {
		client.sendText(message.from, 'Welcome Venom 🕷')
            	.then()
            	.catch((error) => { console.error('Error to send the message: ', error); });
	}
}

async function downloadMedia(client, message) {

	/*
		- Get files sent by the contacts and download inside 'temp_files' folder
		- Asymptotic: O(1)
	*/

	const fileName = message.id.replace('false_', '')
								.replace('@c.us_', '')
								.replace(message.sender.id, '');

	const buffer = await client.decryptFile(message);
    const filePath = TEMP_FILES_FOLDER + `${fileName}.${mime.extension(message.mimetype)}`;
    await fs.writeFile(filePath, buffer, (error) => { if (error != null) { console.log(error); }});
}