import React, {Component, useState} from 'react';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { Document, Page,pdfjs } from 'react-pdf';
import vaccinated from './vaccinated.pdf';
import image from '/home/prakash-ubuntu/Desktop/BC/proj2/FabricNetwork-2.x/reactapp/src/image.png';
import AWS from 'aws-sdk';

var QRCode = require('qrcode.react');
var CryptoJS = require("crypto-js");
var ciphertext="";


/*pdfjs.GlobalWorkerOptions.workerSrc =
`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;*/

/*const S#_BUCKET = 'YOUR_BUCKET_NAME_HERE';
const REGION = '';

AWS.config.update({
  accessKeyId: '',
  secretAcceKey: ''
})

const myBucket = new AWS.S3({
  params: { Bucket: S3_BUCKET},
  region: REGION,
})*/


export default class GetCertificate extends Component {

  constructor(props) {
    super(props);
    this.state = {
      name:'',
      numPages: null,
      pageNumber: 1,
      url:vaccinated
    }
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.generatepdf();
  }

  downloadQR = () => {
    const canvas = document.getElementById("code");
    const pngUrl = canvas.toDataURL("image/png").replace("image/png","image/octe-stream");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "qrcode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  async generatepdf(event) {
    const data = this.props.requirement_data;
    ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), 'secret-key-to-encrypt-beneficiary-data').toString();
    /*const canvas = document.getElementById("qr_code");
    const elements = canvas.attributes;
    console.log(elements)
    //console.log(canvas.src);
    //var images = document.getElementsByTagName("img");
    //let base64Image = $('#qr_code img').attr('src');
    //console.log(canvas.getAttribute("img"))
     console.log(this.$('#code img').attr('src'));
     const code = document.getElementById("code");
    const pngUrl = code.toDataURL('image/png');
    console.log(pngUrl);
   var str = canvas.toDataURL();
    var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i=0, strLen=str.length; i < strLen; i++) {
      bufView[i] = str.charCodeAt(i);
    }

    console.log(buf)

    const mimeType = 'image/png';
    //var pngImageBytes;

   canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        const arrayBuffer = reader.result;
        pngImageBytes=arrayBuffer;
      });
      reader.readAsArrayBuffer(blob);
    },'image/png');

    //console.log('hi'+pngImageBytes);

    // /console.log(pngUrl);

    //const pngImageBytes = await fetch(pngUrl).then((res) => res.arrayBuffer())
    //var pngImageBytes = buf;*/
    const exBytes = await fetch(vaccinated).then((res)=> {
       return res.arrayBuffer();
     });
    //this.setState({renderPdf:exBytes});
    const pdfDoc = await PDFDocument.load(exBytes);

    //font
    const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman)

    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const { width,  height} = firstPage.getSize();
    firstPage.drawText('849377056346', {
      x:70,
      y:207,
      size: 15,
      font: timesRomanFont,
      color: rgb(0, 0.53, 0.71),
    })
    firstPage.drawText('Uphc Sp Nagar,Khammam,Telangana', {
      x:80,
      y:182,
      size: 15,
      font: timesRomanFont,
      color: rgb(0, 0, 0.77),
    })
    firstPage.drawText('12-03-2021', {
      x:94,
      y:156,
      size: 15,
      font: timesRomanFont,
      color: rgb(0, 0, 0.77),
    })

    firstPage.drawText(ciphertext, {
      x:3,
      y:20,
      size: 7,
      font: timesRomanFont,
      color: rgb(0, 0, 0.77),
    })

    /*const pngImage = await pdfDoc.embedPng(pngImageBytes)
    const pngDims = pngImage.scale(0.5)
    firstPage.drawImage(pngImage, {
      x: firstPage.getWidth() / 2 - pngDims.width / 2 + 75,
      y: firstPage.getHeight() / 2 - pngDims.height + 250,
      width: pngDims.width,
      height: pngDims.height,
    })*/

    const url = await pdfDoc.saveAsBase64({dataUri: true});
    //document.querySelector("#mypdf").src = url;
    this.setState({url:url});
    //const pdfBytes = await pdfDoc.save();
    console.log(exBytes);
    console.log(url);
  }

  handleChange(event) {
    this.setState({name:event.target.value});
  }

  render () {
    //this.createPdf();
    console.log('getcert');
    return(
      <>
        <QRCode id="code" value={ciphertext} /><a href="#" onClick={this.downloadQR}>download</a>
      </>
     )
  }
}
