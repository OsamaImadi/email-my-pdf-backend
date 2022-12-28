import { Injectable} from '@nestjs/common';
import * as dotenv from 'dotenv';
import fetch from 'node-fetch';
import { SendFileDto } from './dto/sendFile.dto';
const PDFDocument = require('./utils/pdfTable');
const nodemailer = require("nodemailer");

dotenv.config();

@Injectable()
export class AppService {
  async getBoard(id?:string) {
    id=id?id:'3709724214'

    let query = `{
      boards (newest_first: true, ids: [${id}]){
        name
        items(limit: 10) {
          name
          column_values {
            title
            id
            type
            text
            additional_info
          }
        }
      }
    }`;
    let response = await fetch ("https://api.monday.com/v2", {
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Authorization' : process.env.MONDAY_API
    },
    body: JSON.stringify({
      'query' : query
    })
    })
    .then(res => res.json())
    .then(res => JSON.stringify(res, null, 2));

    return response;
  }

  async createAndSendPdf(result: string, sendFileDto: SendFileDto, imgFile: any){
    let response = JSON.parse(result)
    const doc = new PDFDocument({ bufferPages: true });

    const table:any = {
      headers: ['Title'],
      rows: [
        [],[],[],[],[],[],[],[],[],[]
      ]
    };

    for(let j=0; j<10; j++){
      if(response?.data?.boards[0]?.items[j]?.name){
        table.rows[j].push(response?.data?.boards[0]?.items[j]?.name)
      }
    }

    for(let i=1; i<5; i++){
        table.headers.push(response?.data?.boards[0]?.items[0].column_values[i].title)
        for(let k=0; k<10; k++){
            table.rows[k].push(response?.data?.boards[0]?.items[k]?.column_values[i]?.text)
        }
    }

    doc
      .font('Times-Roman')
      .fontSize(13)
      .text(response?.data?.boards[0]?.name);

    doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold'),
        prepareRow: (row, i) => doc.font('Helvetica').fontSize(11)
    });

    doc.end();

    return await this.sendEmail(doc, sendFileDto, imgFile)
  }

  async sendEmail(file:any, sendFileDto: SendFileDto, imgFile?:any){

    console.log("process.env.NODEMAILER_USERNAME", process.env.NODEMAILER_USERNAME)
    console.log("process.env.NODEMAILER_PASSWORD", process.env.NODEMAILER_PASSWORD)
    var transporter = nodemailer.createTransport({
      host: "smtp-mail.outlook.com", // hostname
      secureConnection: false, // TLS requires secureConnection to be false
      port: 587, // port for secure SMTP
      tls: {
        ciphers:'SSLv3'
      },
      auth: {
          user: process.env.NODEMAILER_USERNAME,
          pass: process.env.NODEMAILER_PASSWORD
      }
    });
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: process.env.NODEMAILER_USERNAME, // sender address
      to: sendFileDto.email, // list of receivers
      subject: "Email my pdf", // Subject line
      text: sendFileDto.text, // plain text body
      html: `<img src="cid:unique@kreata.ee"/><text>${sendFileDto.text}</text>`, // html body
      attachments: [
        {   // stream as an attachment
            filename: 'file.pdf',
            content: file,
            contentType: 'application/pdf'
        },
        {
          filename: 'image.jpg',
          cid: 'unique@kreata.ee',
          content: new Buffer(imgFile[0].buffer, 'utf-8')
        }
      ]
    });

    return {
      messageId:info.messageId,
      message: 'Email Sent'
    }
  }
}
