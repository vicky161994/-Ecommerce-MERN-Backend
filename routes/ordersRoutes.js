const express = require("express");
const expressAsyncHandler = require("express-async-handler");
const orderRouter = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");
const isAuth = require("../middlewares/authMiddleware");
const Order = require("../models/orderModel");
const User = require("../models/userModel");
const mongoose = require("mongoose");
const { sendSMS, sendMail } = require("../config/helpers");

orderRouter.post(
  "/stripe/payment/charge",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const { token, items, totalPrice, address } = req.body;
    const idempotencyKey = uuidv4();
    return stripe.customers
      .create({
        email: token.email,
        source: token.id,
      })
      .then((customer) => {
        stripe.charges
          .create(
            {
              amount: parseInt((totalPrice * 100).toString().split(".")[0]),
              currency: "usd",
              customer: customer.id,
              receipt_email: token.email,
              description: `order placed successfully for worth of ${totalPrice}`,
            },
            { idempotencyKey }
          )
          .then(async (result) => {
            const order = new Order({
              userID: req.user._id,
              items: items,
              address: address,
              itemPrice: req.body.totalAmt,
              shippingPrice: req.body.shippingPrice,
              taxPrice: req.body.taxPrice,
              totalPrice: totalPrice,
              status: "Not Delivered",
            });
            const savedOrder = await order.save();
            sendSMS({
              message: `your order id ${savedOrder._id} has been placed successfully. You will receive another message after dispatching your order.`,
              number: req.user.number,
            });
            let orderID = savedOrder._id.toString().substr(5);
            let date = new Date();
            const month = date.toLocaleString("en-us", { month: "short" });
            const day = date.getDate();
            const year = date.getFullYear();
            const orderDate = `${month} ${day}, ${year}`;
            sendMail({
              email_template: `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
              <html xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office" style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0">
               <head> 
                <meta charset="UTF-8"> 
                <meta content="width=device-width, initial-scale=1" name="viewport"> 
                <meta name="x-apple-disable-message-reformatting"> 
                <meta http-equiv="X-UA-Compatible" content="IE=edge"> 
                <meta content="telephone=no" name="format-detection"> 
                <title>New message</title> 
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
                padding:10px 20px 10px 20px!important;
              }
              @media only screen and (max-width:600px) {p, ul li, ol li, a { line-height:150%!important } h1 { font-size:30px!important; text-align:center; line-height:120%!important } h2 { font-size:26px!important; text-align:center; line-height:120%!important } h3 { font-size:20px!important; text-align:center; line-height:120%!important } .es-header-body h1 a, .es-content-body h1 a, .es-footer-body h1 a { font-size:30px!important } .es-header-body h2 a, .es-content-body h2 a, .es-footer-body h2 a { font-size:26px!important } .es-header-body h3 a, .es-content-body h3 a, .es-footer-body h3 a { font-size:20px!important } .es-header-body p, .es-header-body ul li, .es-header-body ol li, .es-header-body a { font-size:16px!important } .es-content-body p, .es-content-body ul li, .es-content-body ol li, .es-content-body a { font-size:16px!important } .es-footer-body p, .es-footer-body ul li, .es-footer-body ol li, .es-footer-body a { font-size:16px!important } .es-infoblock p, .es-infoblock ul li, .es-infoblock ol li, .es-infoblock a { font-size:12px!important } *[class="gmail-fix"] { display:none!important } .es-m-txt-c, .es-m-txt-c h1, .es-m-txt-c h2, .es-m-txt-c h3 { text-align:center!important } .es-m-txt-r, .es-m-txt-r h1, .es-m-txt-r h2, .es-m-txt-r h3 { text-align:right!important } .es-m-txt-l, .es-m-txt-l h1, .es-m-txt-l h2, .es-m-txt-l h3 { text-align:left!important } .es-m-txt-r img, .es-m-txt-c img, .es-m-txt-l img { display:inline!important } .es-button-border { display:block!important } a.es-button, button.es-button { font-size:20px!important; display:block!important; border-left-width:0px!important; border-right-width:0px!important } .es-btn-fw { border-width:10px 0px!important; text-align:center!important } .es-adaptive table, .es-btn-fw, .es-btn-fw-brdr, .es-left, .es-right { width:100%!important } .es-content table, .es-header table, .es-footer table, .es-content, .es-footer, .es-header { width:100%!important; max-width:600px!important } .es-adapt-td { display:block!important; width:100%!important } .adapt-img { width:100%!important; height:auto!important } .es-m-p0 { padding:0px!important } .es-m-p0r { padding-right:0px!important } .es-m-p0l { padding-left:0px!important } .es-m-p0t { padding-top:0px!important } .es-m-p0b { padding-bottom:0!important } .es-m-p20b { padding-bottom:20px!important } .es-mobile-hidden, .es-hidden { display:none!important } tr.es-desk-hidden, td.es-desk-hidden, table.es-desk-hidden { width:auto!important; overflow:visible!important; float:none!important; max-height:inherit!important; line-height:inherit!important } tr.es-desk-hidden { display:table-row!important } table.es-desk-hidden { display:table!important } td.es-desk-menu-hidden { display:table-cell!important } .es-menu td { width:1%!important } table.es-table-not-adapt, .esd-block-html table { width:auto!important } table.es-social { display:inline-block!important } table.es-social td { display:inline-block!important } .es-menu td a { font-size:16px!important } }
              </style> 
               </head> 
               <body style="width:100%;font-family:arial, 'helvetica neue', helvetica, sans-serif;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;padding:0;Margin:0"> 
                <div class="es-wrapper-color" style="background-color:#EFEFEF"> 
                 <!--[if gte mso 9]>
                    <v:background xmlns:v="urn:schemas-microsoft-com:vml" fill="t">
                      <v:fill type="tile" color="#efefef"></v:fill>
                    </v:background>
                  <![endif]--> 
                 <table class="es-wrapper" width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;padding:0;Margin:0;width:100%;height:100%;background-repeat:repeat;background-position:center top"> 
                   <tr style="border-collapse:collapse"> 
                    <td valign="top" style="padding:0;Margin:0"> 
                     <table cellpadding="0" cellspacing="0" class="es-header" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%;background-color:transparent;background-repeat:repeat;background-position:center top"> 
                       <tr style="border-collapse:collapse"> 
                        <td align="center" style="padding:0;Margin:0"> 
                         <table class="es-header-body" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FEF5E4;width:600px" cellspacing="0" cellpadding="0" bgcolor="#fef5e4" align="center"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:15px;padding-right:15px"> 
                             <!--[if mso]><table style="width:570px" cellpadding="0" cellspacing="0"><tr><td style="width:180px" valign="top"><![endif]--> 
                             <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"> 
                               <tr style="border-collapse:collapse"> 
                                <td class="es-m-p0r" valign="top" align="center" style="padding:0;Margin:0;width:180px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;padding-left:15px;font-size:0"><a href="https://viewstripo.email/" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#999999;font-size:14px"><img src="https://pkciui.stripocdn.email/content/guids/CABINET_5ebd51945adb862745b1a105fbb2c4f4/images/431502878865957.png" alt="Petshop logo" title="Petshop logo" width="118" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td><td style="width:20px"></td><td style="width:370px" valign="top"><![endif]--> 
                             <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td align="left" style="padding:0;Margin:0;width:370px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td style="padding:0;Margin:0"> 
                                     <table class="es-menu" width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                       <tr class="links" style="border-collapse:collapse"> 
                                        <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:20px;padding-bottom:10px;border:0" width="25.00%" bgcolor="transparent" align="center"><a style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;color:#333333;font-size:16px" href="https://viewstripo.email/">Accessories</a></td> 
                                        <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:20px;padding-bottom:10px;border:0" width="25.00%" bgcolor="transparent" align="center"><a style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;color:#333333;font-size:16px" href="https://viewstripo.email/">Belts</a></td> 
                                        <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:20px;padding-bottom:10px;border:0" width="25.00%" bgcolor="transparent" align="center"><a style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;color:#333333;font-size:16px" href="https://viewstripo.email/">Cages</a></td> 
                                        <td style="Margin:0;padding-left:5px;padding-right:5px;padding-top:20px;padding-bottom:10px;border:0" width="25.00%" bgcolor="transparent" align="center"><a style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:none;display:block;color:#333333;font-size:16px" href="https://viewstripo.email/">Other</a></td> 
                                       </tr> 
                                     </table></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td></tr></table><![endif]--></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table> 
                     <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
                       <tr style="border-collapse:collapse"> 
                        <td align="center" style="padding:0;Margin:0"> 
                         <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px"> 
                             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px"> 
                                 <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;border-radius:0px" width="100%" cellspacing="0" cellpadding="0" role="presentation"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;padding-top:10px;padding-bottom:15px"><h1 style="Margin:0;line-height:36px;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif;font-size:30px;font-style:normal;font-weight:normal;color:#333333">Thanks for your order<br></h1></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="Margin:0;padding-top:5px;padding-bottom:5px;padding-left:40px;padding-right:40px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">You'll receive an email when your items are shipped. If you have any questions, Call us 96678-69289</p></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;padding-bottom:10px;padding-top:15px"><span class="es-button-border" style="border-style:solid;border-color:#2CB543;background:#D48344 none repeat scroll 0% 0%;border-width:0px;display:inline-block;border-radius:5px;width:auto;border-top:0px solid #2CB543;border-bottom:0px solid #2CB543"><a href="https://viewstripo.email/" class="es-button" target="_blank" style="mso-style-priority:100 !important;text-decoration:underline;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;color:#FFFFFF;font-size:16px;border-style:solid;border-color:#D48344;border-width:10px 20px 10px 20px;display:inline-block;background:#D48344 none repeat scroll 0% 0%;border-radius:5px;font-family:arial, 'helvetica neue', helvetica, sans-serif;font-weight:normal;font-style:normal;line-height:19px;width:auto;text-align:center;border-top-width:10px;border-bottom-width:10px">View order status</a></span></td> 
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
                            <td align="left" style="Margin:0;padding-top:20px;padding-left:20px;padding-right:20px;padding-bottom:30px"> 
                             <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:280px" valign="top"><![endif]--> 
                             <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"> 
                               <tr style="border-collapse:collapse"> 
                                <td class="es-m-p20b" align="left" style="padding:0;Margin:0;width:280px"> 
                                 <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FEF9EF;border-color:#EFEFEF;border-width:1px 0px 1px 1px;border-style:solid" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fef9ef" role="presentation"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">SUMMARY:</h4></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px"> 
                                     <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="left" role="presentation"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0"><span style="font-size:14px;line-height:21px">Order #:</span></td> 
                                        <td style="padding:0;Margin:0"><span style="font-size:14px;line-height:21px">${orderID}</span></td> 
                                       </tr> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0"><span style="font-size:14px;line-height:21px">Order Date:</span></td> 
                                        <td style="padding:0;Margin:0"><span style="font-size:14px;line-height:21px">${orderDate}</span></td> 
                                       </tr> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0"><span style="font-size:14px;line-height:21px">Order Total:</span></td> 
                                        <td style="padding:0;Margin:0"><span style="font-size:14px;line-height:21px">$${
                                          savedOrder.totalPrice
                                        }</span></td> 
                                       </tr> 
                                     </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><br></p></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td><td style="width:0px"></td><td style="width:280px" valign="top"><![endif]--> 
                             <table class="es-right" cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:right"> 
                               <tr style="border-collapse:collapse"> 
                                <td align="left" style="padding:0;Margin:0;width:280px"> 
                                 <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:separate;border-spacing:0px;background-color:#FEF9EF;border-width:1px;border-style:solid;border-color:#EFEFEF" width="100%" cellspacing="0" cellpadding="0" bgcolor="#fef9ef" role="presentation"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="Margin:0;padding-bottom:10px;padding-top:20px;padding-left:20px;padding-right:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">SHIPPING ADDRESS:<br></h4></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="padding:0;Margin:0;padding-bottom:20px;padding-left:20px;padding-right:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">${
                                      savedOrder.address[0].fullName
                                    }</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">${
                savedOrder.address[0].houseNumber
              }</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">${
                savedOrder.address[0].city
              } ${savedOrder.address[0].state} ${
                savedOrder.address[0].pinCode
              }</p></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td></tr></table><![endif]--></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table> 
                     <table class="es-content" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;table-layout:fixed !important;width:100%"> 
                       <tr style="border-collapse:collapse"> 
                        <td align="center" style="padding:0;Margin:0"> 
                         <table class="es-content-body" cellspacing="0" cellpadding="0" bgcolor="#ffffff" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FFFFFF;width:600px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="Margin:0;padding-top:10px;padding-bottom:10px;padding-left:20px;padding-right:20px"> 
                             <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:270px" valign="top"><![endif]--> 
                             <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"> 
                               <tr style="border-collapse:collapse"> 
                                <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:270px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="padding:0;Margin:0;padding-left:20px"><h4 style="Margin:0;line-height:120%;mso-line-height-rule:exactly;font-family:'trebuchet ms', helvetica, sans-serif">ITEMS ORDERED</h4></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td><td style="width:20px"></td><td style="width:270px" valign="top"><![endif]--> 
                             <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td align="left" style="padding:0;Margin:0;width:270px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="padding:0;Margin:0"> 
                                     <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0"><span style="font-size:13px">NAME</span></td> 
                                        <td style="padding:0;Margin:0;width:60px;text-align:center"><span style="font-size:13px"><span style="line-height:100%">QTY</span></span></td> 
                                        <td style="padding:0;Margin:0;width:100px;text-align:center"><span style="font-size:13px"><span style="line-height:100%">PRICE</span></span></td> 
                                       </tr> 
                                     </table></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td></tr></table><![endif]--></td> 
                           </tr> 

                           ${savedOrder.items
                             .map(function (item) {
                               return `<tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px"> 
                             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0"> 
                                     <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> 
                                       </tr> 
                                     </table></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="Margin:0;padding-top:5px;padding-bottom:10px;padding-left:20px;padding-right:20px"> 
                             <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:178px" valign="top"><![endif]--> 
                             <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"> 
                               <tr style="border-collapse:collapse"> 
                                <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:178px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;font-size:0"><a href="https://viewstripo.email" target="_blank" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#D48344;font-size:14px"><img src="${item.image}" alt="${item.title}" class="adapt-img" title="${item.title}" width="125" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></a></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td><td style="width:20px"></td><td style="width:362px" valign="top"><![endif]--> 
                             <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td align="left" style="padding:0;Margin:0;width:362px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><br></p> 
                                     <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:100%" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" role="presentation"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0">${item.title}</td> 
                                        <td style="padding:0;Margin:0;width:60px;text-align:center">${item.qty}</td> 
                                        <td style="padding:0;Margin:0;width:100px;text-align:center">$${item.price}</td> 
                                       </tr> 
                                     </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><br></p></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td></tr></table><![endif]--></td> 
                           </tr> `;
                             })
                             .join("")}


                           
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px"> 
                             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0"> 
                                     <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> 
                                       </tr> 
                                     </table></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px"> 
                             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0"> 
                                     <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> 
                                       </tr> 
                                     </table></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:0;Margin:0;padding-left:20px;padding-right:20px"> 
                             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td valign="top" align="center" style="padding:0;Margin:0;width:560px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="center" style="padding:0;Margin:0;padding-bottom:10px;font-size:0"> 
                                     <table width="100%" height="100%" cellspacing="0" cellpadding="0" border="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;border-bottom:1px solid #EFEFEF;background:#FFFFFF none repeat scroll 0% 0%;height:1px;width:100%;margin:0px"></td> 
                                       </tr> 
                                     </table></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table></td> 
                           </tr> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="Margin:0;padding-top:5px;padding-left:20px;padding-bottom:30px;padding-right:40px"> 
                             <table width="100%" cellspacing="0" cellpadding="0" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td valign="top" align="center" style="padding:0;Margin:0;width:540px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="right" style="padding:0;Margin:0"> 
                                     <table style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;width:500px" class="cke_show_border" cellspacing="1" cellpadding="1" border="0" align="right" role="presentation"> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px">Subtotal (${
                                          savedOrder.items.length
                                        } items):</td> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px">$${
                                          savedOrder.itemPrice
                                        }</td> 
                                       </tr> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px">Shipping Price:</td> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px;color:#D48344"><strong>$${
                                          savedOrder.shippingPrice
                                        }</strong></td> 
                                       </tr> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px">Tax Price:</td> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px;color:#D48344"><strong>$${
                                          savedOrder.taxPrice
                                        }</strong></td> 
                                       </tr> 
                                       <tr style="border-collapse:collapse"> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px"><strong>Order Total:</strong></td> 
                                        <td style="padding:0;Margin:0;text-align:right;font-size:18px;line-height:27px;color:#D48344"><strong>$${
                                          savedOrder.totalPrice
                                        }</strong></td> 
                                       </tr> 
                                     </table><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><br></p></td> 
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
                         <table class="es-footer-body" cellspacing="0" cellpadding="0" align="center" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;background-color:#FEF5E4;width:600px"> 
                           <tr style="border-collapse:collapse"> 
                            <td align="left" style="padding:20px;Margin:0"> 
                             <!--[if mso]><table style="width:560px" cellpadding="0" cellspacing="0"><tr><td style="width:178px" valign="top"><![endif]--> 
                             <table class="es-left" cellspacing="0" cellpadding="0" align="left" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px;float:left"> 
                               <tr style="border-collapse:collapse"> 
                                <td class="es-m-p0r es-m-p20b" valign="top" align="center" style="padding:0;Margin:0;width:178px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td class="es-m-p0l es-m-txt-c" align="left" style="padding:0;Margin:0;font-size:0"><img src="https://pkciui.stripocdn.email/content/guids/CABINET_5ebd51945adb862745b1a105fbb2c4f4/images/431502878865957.png" alt="Petshop logo" title="Petshop logo" width="108" style="display:block;border:0;outline:none;text-decoration:none;-ms-interpolation-mode:bicubic"></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-bottom:5px;padding-top:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Po Box 3453 Colins St.</p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Ceduna 4096 Australia</p></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-top:5px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><a target="_blank" href="tel:123456789" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:14px">123456789</a><br><a target="_blank" href="mailto:your@mail.com" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:14px">your@mail.com</a></p></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td><td style="width:20px"></td><td style="width:362px" valign="top"><![endif]--> 
                             <table cellspacing="0" cellpadding="0" align="right" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                               <tr style="border-collapse:collapse"> 
                                <td align="left" style="padding:0;Margin:0;width:362px"> 
                                 <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="mso-table-lspace:0pt;mso-table-rspace:0pt;border-collapse:collapse;border-spacing:0px"> 
                                   <tr style="border-collapse:collapse"> 
                                    <td class="es-m-txt-c" align="left" style="padding:0;Margin:0;padding-top:15px;padding-bottom:20px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px"><span style="font-size:20px;line-height:30px">Information</span></p></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td class="es-m-txt-c" align="left" style="padding:0;Margin:0"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">Vector graphics designed by <a target="_blank" href="http://www.freepik.com/" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:14px">Freepik</a>.<br></p><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:21px;color:#333333;font-size:14px">You are receiving this email because you have visited our site or asked us about regular newsletter<br></p></td> 
                                   </tr> 
                                   <tr style="border-collapse:collapse"> 
                                    <td align="left" class="es-m-txt-c" style="padding:0;Margin:0;padding-top:10px"><p style="Margin:0;-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;font-family:arial, 'helvetica neue', helvetica, sans-serif;line-height:18px;color:#333333;font-size:12px"><a target="_blank" href="" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:12px;line-height:18px" class="unsubscribe">Unsubscribe</a> ♦ <a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:12px">Update Preferences</a> ♦ <a target="_blank" href="https://viewstripo.email" style="-webkit-text-size-adjust:none;-ms-text-size-adjust:none;mso-line-height-rule:exactly;text-decoration:underline;color:#333333;font-size:12px">Customer Support</a></p></td> 
                                   </tr> 
                                 </table></td> 
                               </tr> 
                             </table> 
                             <!--[if mso]></td></tr></table><![endif]--></td> 
                           </tr> 
                         </table></td> 
                       </tr> 
                     </table> 
                     </td> 
                   </tr> 
                 </table> 
                </div>  
               </body>
              </html>`,
              email: req.user.email,
              subject: `Your thevickyk.com order for order ID ${savedOrder._id}`,
            });
            await User.findByIdAndUpdate(req.user._id, { cartItems: [] });
            res.status(200).json(result);
          })
          .catch((error) => {
            console.log(error);
            res.status(404).json(error);
          });
      })
      .catch((error) => {
        console.log(error);
        const order = new Order({
          userID: req.user._id,
          items: items,
          address: address,
          itemPrice: req.body.totalAmt,
          shippingPrice: req.body.shippingPrice,
          taxPrice: req.body.taxPrice,
          totalPrice: totalPrice,
          status: "Payment Failed",
        });
        order.save();
        res.status(404).json(error);
      });
  })
);

orderRouter.post(
  "/get-order-list",
  isAuth,
  expressAsyncHandler(async (req, res) => {
    const limit = req.body.limit || 9;
    let skip = (req.body.page - 1) * 9 || 0;
    const order = await Order.find({
      userID: mongoose.Types.ObjectId(req.user._id),
    })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    let orderCount = await Order.countDocuments({
      userID: mongoose.Types.ObjectId(req.user._id),
    });
    orderCount = Math.ceil(orderCount / limit);
    if (order) {
      return res.status(200).send({
        message: "order list fetched successfully",
        data: order,
        totalPage: orderCount,
      });
    } else {
      return res.status(200).send({
        message: "order list fetched successfully",
        data: [],
        totalPage: 0,
      });
    }
    res.status(200).send(order);
  })
);

module.exports = orderRouter;
