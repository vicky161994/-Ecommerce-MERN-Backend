const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const userRouter = express.Router();
const User = require("../models/userModel");
const generateToken = require("../config/utlis");
const { sendSMS, sendMail } = require("../config/helpers");
const isAuth = require("../middlewares/authMiddleware");
const mongoose = require("mongoose");
const fetch = require("node-fetch");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

userRouter.post(
  "/register",
  expressAsyncHandler(async (req, res) => {
    if (
      !req.body.name ||
      !req.body.email ||
      !req.body.password ||
      !req.body.number
    ) {
      return res.status(401).send({
        message: "Fields are missing",
        status: 401,
      });
    }
    const isUserExist = await User.findOne({ email: req.body.email });
    if (isUserExist) {
      return res.status(200).send({
        message: "This email already registered",
        status: 204,
      });
    }
    const user = new User({
      name: req.body.name,
      email: req.body.email,
      number: req.body.number,
      password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
    });
    const registeredUser = await user.save();
    sendSMS({
      message:
        "Thank you for register with us. Please visit our wesite and place your first order",
      number: req.body.number,
    });
    sendMail({
      email_template: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
       <head> 
        <meta charset="UTF-8"> 
        <meta content="width=device-width, initial-scale=1" name="viewport"> 
        <meta name="x-apple-disable-message-reformatting"> 
        <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
        <meta content="telephone=no" name="format-detection"> 
        <title>New Template</title> 
        <!--[if (mso 16)]>
          <style type="text/css">
          a {text-decoration: none;}
          </style>
          <![endif]--> 
        <!--[if gte mso 9]><style>sup { font-size: 100% !important; }</style><![endif]--> 
        <!--[if gte mso 9]>
      <xml>
          <o:OfficeDocumentSettings>
          <o:AllowPNG></o:AllowPNG>
          <o:PixelsPerInch>96</o:PixelsPerInch>
          </o:OfficeDocumentSettings>
      </xml>
      <![endif]--> 
        <!--[if !mso]><!-- --> 
        <link href="https://fonts.googleapis.com/css?family=Lato:400,400i,700,700i" rel="stylesheet"> 
        <!--<![endif]--> 
        <style type="text/css">
      #outlook a {
        padding:0;
      }
      .ExternalClass {
        width:100%;
      }
      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass font,
      .ExternalClass td,
      .ExternalClass div {
        line-height:100%;
      }
      .es-button {
        mso-style-priority:100!important;
        text-decoration:none!important;
      }
      a[x-apple-data-detectors] {
        color:inherit!important;
        text-decoration:none!important;
        font-size:inherit!important;
        font-family:inherit!important;
        font-weight:inherit!important;
        line-height:inherit!important;
      }
      .es-desk-hidden {
        display:none;
        float:left;
        overflow:hidden;
        width:0;
        max-height:0;
        line-height:0;
        mso-hide:all;
      }
      [data-ogsb] .es-button {
        border-width:0!important;
        padding:15px 25px 15px 25px!important;
      }
      [data-ogsb] .es-button.es-button-1 {
        padding:15px 25px!important;
      }
      @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-menu td a { font-size:16px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-width:15px 25px 15px 25px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } }
      </style> 
       </head> 
       <body style="width:100%;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
        <div class="es-wrapper-color" style="background-color:#F4F4F4"> 
         <!--[if gte mso 9]>
            <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
              <v:fill type="tile" color="#f4f4f4"></v:fill>
            </v:background>
          <![endif]--> 
         <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"> 
           <tr class="gmail-fix" height="0" style="border-collapse:collapse"> 
            <td style="padding:0;Margin:0"> 
             <table cellspacing="0" cellpadding="0" border="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:600px"> 
               <tr style="border-collapse:collapse"> 
                <td cellpadding="0" cellspacing="0" border="0" style="padding:0;Margin:0;line-height:1px;min-width:600px" height="0"><img src="https://pkciui.stripocdn.email/content/guids/CABINET_837dc1d79e3a5eca5eb1609bfe9fd374/images/41521605538834349.png" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic;max-height:0px;min-height:0px;min-width:600px;width:600px" alt width="600" height="1"></td> 
               </tr> 
             </table></td> 
           </tr> 
           <tr style="border-collapse:collapse"> 
            <td valign="top" style="padding:0;Margin:0"> 
             <table class="es-header" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:#7C72DC;background-repeat:repeat;background-position:center top"> 
               <tr style="border-collapse:collapse"> 
                <td style="padding:0;Margin:0;background-color:#7C72DC" bgcolor="#7c72dc" align="center"> 
                 <table class="es-header-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#7C72DC;width:600px"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="Margin:0;padding-bottom:10px;padding-left:10px;padding-right:10px;padding-top:20px"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:580px"> 
                         <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:25px;padding-bottom:25px;font-size:0">
                              <!-- <img src="https://pkciui.stripocdn.email/content/guids/CABINET_3df254a10a99df5e44cb27b842c2c69e/images/7331519201751184.png" alt style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic" width="40"> -->
                            </td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table> 
             <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
               <tr style="border-collapse:collapse"> 
                <td style="padding:0;Margin:0;background-color:#7C72DC" bgcolor="#7c72dc" align="center"> 
                 <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="padding:0;Margin:0"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> 
                         <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FFFFFF;border-radius:4px" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="Margin:0;padding-bottom:5px;padding-left:15px;padding-right:30px;padding-top:35px"><h1 style="Margin:0;line-height:31px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:26px;font-style:normal;font-weight:normal;color:#111111"><strong>Dear ${req.body.name}</strong></h1></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td bgcolor="#ffffff" align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:20px;padding-right:20px;font-size:0"> 
                             <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td style="padding:0;Margin:0;border-bottom:1px solid #FFFFFF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> 
                               </tr> 
                             </table></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table> 
             <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
               <tr style="border-collapse:collapse"> 
                <td align="center" style="padding:0;Margin:0"> 
                 <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="padding:0;Margin:0"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> 
                         <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF" width="100%" cellspacing="0" cellpadding="0" bgcolor="#ffffff" role="presentation"> 
                           <tr style="border-collapse:collapse"> 
                            <td class="es-m-txt-l" bgcolor="#ffffff" align="left" style="Margin:0;padding-bottom:15px;padding-top:20px;padding-left:30px;padding-right:30px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">Thank you for register with us. You account has been successfully created. Please visit our website and place your first order.</p></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="padding:0;Margin:0;padding-bottom:20px;padding-left:30px;padding-right:30px"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:540px"> 
                         <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="center" style="Margin:0;padding-left:10px;padding-right:10px;padding-top:15px;padding-bottom:15px"><span class="es-button-border" style="border-style:solid;border-color:#7C72DC;background:#7C72DC;border-width:1px;display:inline-block;border-radius:8px;width:auto"><a href="https://viewstripo.email/" class="es-button es-button-1" target="_blank" style="mso-style-priority:100 !important;text-decoration:none;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:14px;border-style:solid;border-color:#7C72DC;border-width:15px 25px;display:inline-block;background:#7C72DC;border-radius:8px;font-family:helvetica, 'helvetica neue', arial, verdana, sans-serif;font-weight:normal;font-style:normal;line-height:17px;width:auto;text-align:center">LOGIN NOW</a></span></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table> 
             <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
               <tr style="border-collapse:collapse"> 
                <td align="center" style="padding:0;Margin:0"> 
                 <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="padding:0;Margin:0"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> 
                         <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:4px;background-color:#111111" width="100%" cellspacing="0" cellpadding="0" bgcolor="#111111" role="presentation"> 
                           <tr style="border-collapse:collapse"> 
                            <td class="es-m-txt-l" bgcolor="#111111" align="left" style="padding:0;Margin:0;padding-left:30px;padding-right:30px;padding-top:35px"><h2 style="Margin:0;line-height:29px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:24px;font-style:normal;font-weight:normal;color:#FFFFFF">Want a more secure account?<br></h2></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td class="es-m-txt-l" align="left" style="padding:0;Margin:0;padding-top:20px;padding-left:30px;padding-right:30px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:27px;color:#666666;font-size:18px">We support two-factor authentication to help keep your information private.<br></p></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td esdev-links-color="#7c72dc" align="left" style="Margin:0;padding-top:20px;padding-left:30px;padding-right:30px;padding-bottom:40px"><a target="_blank" href="https://viewstripo.email/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#7C72DC;font-size:18px">See how easy it is to get started</a></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table> 
             <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
               <tr style="border-collapse:collapse"> 
                <td align="center" style="padding:0;Margin:0"> 
                 <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px" cellspacing="0" cellpadding="0" align="center"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="padding:0;Margin:0"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> 
                         <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="center" style="Margin:0;padding-top:10px;padding-bottom:20px;padding-left:20px;padding-right:20px;font-size:0"> 
                             <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td style="padding:0;Margin:0;border-bottom:1px solid #F4F4F4;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> 
                               </tr> 
                             </table></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table> 
             <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
               <tr style="border-collapse:collapse"> 
                <td align="center" style="padding:0;Margin:0"> 
                 <table class="es-content-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#C6C2ED;width:600px" cellspacing="0" cellpadding="0" bgcolor="#c6c2ed" align="center"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="padding:0;Margin:0"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:600px"> 
                         <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:4px" width="100%" cellspacing="0" cellpadding="0" role="presentation"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="center" style="padding:0;Margin:0;padding-top:30px;padding-left:30px;padding-right:30px"><h3 style="Margin:0;line-height:24px;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;font-size:20px;font-style:normal;font-weight:normal;color:#111111">Need more help?</h3></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td esdev-links-color="#7c72dc" align="center" style="padding:0;Margin:0;padding-bottom:30px;padding-left:30px;padding-right:30px"><a target="_blank" href="https://viewstripo.email/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#7C72DC;font-size:18px">We’re here, ready to talk</a></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table> 
             <table cellpadding="0" cellspacing="0" class="es-footer" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"> 
               <tr style="border-collapse:collapse"> 
                <td align="center" style="padding:0;Margin:0"> 
                 <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:transparent;width:600px"> 
                   <tr style="border-collapse:collapse"> 
                    <td align="left" style="Margin:0;padding-top:30px;padding-bottom:30px;padding-left:30px;padding-right:30px"> 
                     <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                       <tr style="border-collapse:collapse"> 
                        <td valign="top" align="center" style="padding:0;Margin:0;width:540px"> 
                         <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#666666;font-size:14px"><strong><a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#111111;font-size:14px">Dashboard</a> - <a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#111111;font-size:14px">Billing</a> - <a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#111111;font-size:14px">Help</a></strong></p></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-top:25px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#666666;font-size:14px">You received this email because you just signed up for a new account. If it looks weird, <strong><a class="view" target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#111111;font-size:14px">view it in your browser</a></strong>.</p></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-top:25px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#666666;font-size:14px">If these emails get annoying, please feel free to&nbsp;<strong><a target="_blank" class="unsubscribe" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#111111;font-size:14px">unsubscribe</a></strong>.</p></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-top:25px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:lato, 'helvetica neue', helvetica, arial, sans-serif;line-height:21px;color:#666666;font-size:14px">Ceej - 1234 Main Street - Anywhere, MA - 56789</p></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table></td> 
                   </tr> 
                 </table></td> 
               </tr> 
             </table></td> 
           </tr> 
         </table> 
        </div>  
       </body>
      </html>`,
      email: req.body.email,
      subject: `Account created successfully`,
    });
    res.send({
      message: "User Registered Successfully",
      status: "201",
    });
  })
);

userRouter.post(
  "/login",
  expressAsyncHandler(async (req, res) => {
    if (!req.body.email || !req.body.password) {
      return res.status(401).send({
        status: 401,
        message: "Fields are required",
      });
    }
    const isUserExist = await User.findOne({ email: req.body.email });
    if (!isUserExist) {
      return res.status(401).send({
        status: 401,
        message: "Email not found!",
      });
    }
    if (bcrypt.compareSync(req.body.password, isUserExist.password)) {
      return res.status(200).send({
        _id: isUserExist._id,
        name: isUserExist.name,
        email: isUserExist.email,
        number: isUserExist.number,
        wishlist: isUserExist.wishlist,
        cartItems: isUserExist.cartItems,
        address: isUserExist.address,
        token: generateToken(isUserExist),
      });
    } else {
      return res.status(401).send({
        message: "Invalid Credentials",
      });
    }
  })
);

userRouter.post(
  "/add-wishlist",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body.productId) {
      return res.status(401).send({
        message: "productId is missing",
      });
    }
    const user = await User.findById(req.user._id);
    if (user.wishlist.includes(req.body.productId)) {
      const updateResponse = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $pull: { wishlist: req.body.productId } }
      );
    } else {
      const updateResponse = await User.findOneAndUpdate(
        { _id: req.user._id },
        { $push: { wishlist: req.body.productId } }
      );
    }
    return res.status(200).send({ status: 201, message: "wishlist manage" });
  })
);

userRouter.post(
  "/add-to-cart",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body) {
      return res
        .status(401)
        .send({ status: 401, message: "Cart items missing" });
    }
    let finalData = [];
    req.body.cartItems.forEach(async (element) => {
      let _id = mongoose.Types.ObjectId(element.productId);
      let data = { productId: _id, qty: element.qty };
      finalData.push(data);
    });
    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        cartItems: finalData,
      }
    );
    return res.status(201).send({ message: "Cart managed" });
  })
);

userRouter.post(
  "/add-address",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    if (!req.body) {
      return res.status(401).send({ status: 401, message: "address missing" });
    }
    const user = await User.findById(req.user._id);
    const updateResponse = await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { address: req.body } }
    );
    const updatedUser = await User.findById(req.user._id, {
      address: 1,
      _id: 0,
    });
    return res.status(201).send(updatedUser);
  })
);

userRouter.post(
  "/delete-address",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { index } = req.body;
    let address = await User.find(
      { _id: req.user._id },
      { address: 1, _id: 0 }
    );
    address[0].address.splice(index, 1);
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { address: address[0].address }
    );
    return res.status(200).send("ADDRESS_DELETED");
  })
);

userRouter.post(
  "/edit-address",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const {
      index,
      fullName,
      number,
      pinCode,
      state,
      city,
      houseNumber,
      roadName,
    } = req.body;
    let address = await User.find(
      { _id: req.user._id },
      { address: 1, _id: 0 }
    );
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $set: { address: [] } }
    );
    let addressForEdit = address[0].address[index];
    addressForEdit.fullName = fullName;
    addressForEdit.number = number;
    addressForEdit.pinCode = pinCode;
    addressForEdit.state = state;
    addressForEdit.city = city;
    addressForEdit.houseNumber = houseNumber;
    addressForEdit.roadName = roadName;
    address[0].address[index] = addressForEdit;
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { address: address[0].address } }
    );
    const updatedUser = await User.findById(req.user._id, {
      address: 1,
      _id: 0,
    });
    return res.status(201).send(updatedUser);
  })
);

userRouter.post(
  "/update-personal-detail",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { name, number } = req.body;
    if (!name && !number) {
      return res.status(401).send({ status: 401, message: "Field missing" });
    }
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name: name });
    }
    if (number) {
      await User.findByIdAndUpdate(req.user._id, { number: number });
    }
    return res
      .status(200)
      .send({ status: 200, message: "PROFILE_DETAIL_CHANGE" });
  })
);

userRouter.post(
  "/login-with-facebook",
  expressAsyncHandler(async (req, res) => {
    const { accessToken, userID } = req.body;
    let urlGraphFacebook = `https://graph.facebook.com/v2.11/${userID}/?fields=id,name,email&access_token=${accessToken}`;
    await fetch(urlGraphFacebook, { method: "GET" })
      .then((response) => response.json())
      .then(async (json) => {
        const { email, name } = json;
        if (!email || !name) {
          return res.status(401).send({
            status: 401,
            message: "Fields are required",
          });
        }
        const isUserExist = await User.findOne({ email: email });
        if (!isUserExist) {
          const user = new User({
            name: name,
            email: email,
            number: null,
            loggedInVia: "Facebook",
          });
          const registeredUser = await user.save();
          return res.status(200).send({
            _id: registeredUser._id,
            name: registeredUser.name,
            email: registeredUser.email,
            number: registeredUser.number,
            wishlist: registeredUser.wishlist,
            cartItems: registeredUser.cartItems,
            address: registeredUser.address,
            token: generateToken(registeredUser),
          });
        } else {
          return res.status(200).send({
            _id: isUserExist._id,
            name: isUserExist.name,
            email: isUserExist.email,
            number: isUserExist.number,
            wishlist: isUserExist.wishlist,
            cartItems: isUserExist.cartItems,
            address: isUserExist.address,
            token: generateToken(isUserExist),
          });
        }
      });
  })
);

userRouter.post(
  "/login-with-google",
  expressAsyncHandler(async (req, res) => {
    const { tokenId } = req.body;
    client
      .verifyIdToken({
        idToken: tokenId,
        audience: process.env.GOOGLE_CLIENT_ID,
      })
      .then(async (response) => {
        const { email_verified, name, email } = response.payload;
        if (!email || !name) {
          return res.status(401).send({
            status: 401,
            message: "Fields are required",
          });
        }
        const isUserExist = await User.findOne({ email: email });
        if (!isUserExist) {
          const user = new User({
            name: name,
            email: email,
            number: null,
            loggedInVia: "Google",
          });
          const registeredUser = await user.save();
          return res.status(200).send({
            _id: registeredUser._id,
            name: registeredUser.name,
            email: registeredUser.email,
            number: registeredUser.number,
            wishlist: registeredUser.wishlist,
            cartItems: registeredUser.cartItems,
            address: registeredUser.address,
            token: generateToken(registeredUser),
          });
        } else {
          return res.status(200).send({
            _id: isUserExist._id,
            name: isUserExist.name,
            email: isUserExist.email,
            number: isUserExist.number,
            wishlist: isUserExist.wishlist,
            cartItems: isUserExist.cartItems,
            address: isUserExist.address,
            token: generateToken(isUserExist),
          });
        }
      });
  })
);

module.exports = userRouter;
