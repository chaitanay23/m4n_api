const Order = require("../../models/order");
const Address = require("../../models/address");
const Package = require("../../models/package");
const Cart = require("../../models/cart");
const Cart_item = require("../../models/cart-item");
const fs = require("fs");
var pdf = require("html-pdf");
const formidable = require("formidable");
const converter = require("number-to-words");

exports.generator = (req, res) => {
  var invoice_no,
    invoice_date,
    supply_date,
    supply_place,
    party_name,
    party_address,
    desc_item,
    qty,
    prod_rate,
    prod_amount,
    prod_disc,
    tax_amount,
    net_payable,
    del_charges,
    del_disc,
    del_tax,
    hsn;

  new formidable.IncomingForm().parse(req, (err, fields) => {
    if (err) {
      console.error("Error", err);
      throw err;
    }

    var order_id = fields["order_id"];
    var reference_id = fields["reference_id"];

    Order.findOne({
      where: {
        id: order_id,
        reference_id: reference_id
      },
      include: [
        {
          model: Address
        },
        {
          model: Cart,
          include: [
            {
              model: Cart_item,
              include: [
                {
                  model: Package
                }
              ]
            }
          ]
        }
      ]
    })
      .then(order => {
        if (!order) {
          res.status(400).json({
            status: "false",
            message: "Provide valid order id"
          });
        } else {
          invoice_no = reference_id;
          invoice_date = order.createdAt.toISOString().split("T")[0];
          supply_date = invoice_date;
          supply_place = order.address.city;
          party_address = order.address.address;
          party_name = order.address.name;
          prod_disc = order.discountAmount;
          tax_amount = order.product_gst_tax;
          net_payable = order.netPayable;
          del_charges = order.delivery_charges;
          del_disc = order.delivery_discount;
          del_tax = order.delivery_gst_tax;
          desc_item = order.cart.cartItems[0].package.name;
          qty = 1;
          prod_rate = order.cart.cartItems[0].price;
          prod_amount = order.cart.cartItems[0].price;
          hsn = 3926099;

          var htmlString = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <!-- Required meta tags -->
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
      <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
      <link href="https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.2/css/bootstrap.min.css">
    <style>
    .invoice-box {
        width: 100%;
        margin: auto;
        padding: 1px;
        border: 1px solid #000;
        box-shadow: 0 0 10px rgba(0, 0, 0, .15);
        font-size: 8px;
        line-height: 24px;
        font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
        color: #555;
    }
    hr{
        margin-top: 20px;
        margin-bottom: 20px;
        border: 0;
        border-top: 1px solid #000;
    }
    
    .table-list{
        background: #eee;
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
    }
    .heading{
        height: 74px;
        border-top: 1px solid #000;
        border-bottom: 1px solid #000;
    }
    .invoice-box table {
        width: 100%;
        line-height: inherit;
        text-align: left;
        /* margin-bottom: 40px;
        border-bottom: 1px solid #000; */
    }
    
    .invoice-box table td th{
      padding: 5px;
      vertical-align: top;
    }
    
    .invoice-box table tr td:nth-child(n+2) {
      text-align: right;
    }
    
    .invoice-box table tr.top table td {
      padding-bottom: 20px;
    }
    
    .invoice-box table tr.top table td.title {
      font-size: 15px;
      line-height: 45px;
      color: #333;
    }
    
    .invoice-box table tr.information table td {
      padding-bottom: 40px;
    }
    
    .invoice-box table tr.heading td {
      background: #eee;
      /* border-bottom: 1px solid #ddd; */
      font-weight: bold;
    }
    
    .invoice-box table tr.details td {
      padding-bottom: 20px;
    }
    
    .invoice-box table tr.item td{
      border-bottom: 1px solid #eee;
    }
    
    .invoice-box table tr.item.last td {
      border-bottom: none;
    }
    
    .invoice-box table tr.item input {
      padding-left: 5px;
    }
    
    .invoice-box table tr.item td:first-child input {
      margin-left: -5px;
      width: 100%;
    }
    
    .invoice-box table tr.total td:nth-child(2) {
      /* border-top: 2px solid #eee; */
      font-weight: bold;
    }
    
    .invoice-box input[type=number] {
      width: 60px;
    }
    
    @media only screen and (max-width: 600px) {
      .invoice-box table tr.top table td {
          width: 100%;
          display: block;
          text-align: center;
      }
      
      .invoice-box table tr.information table td {
          width: 100%;
          display: block;
          text-align: center;
      }
    }
    
    /** RTL **/
    .rtl {
      direction: rtl;
      font-family: Tahoma, 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
    }
    
    .rtl table {
      text-align: right;
    }
    
    .rtl table tr td:nth-child(2) {
      text-align: left;
    }
    </style>
    </head>
    <body>
        <div class="invoice-box">
            <table cellpadding="0" cellspacing="0">
              <tr class="top">
                <td colspan="4">
                  <table>
                    <tr>
                      <td class="title">
                        <img src="file://${__dirname}/candy-logo.png" alt="m4n" style="width:70%; max-width:200px;">
                      </td>
    
                      <td style="text-align:left;">
                        <h3>BESMARTY MARKET PLACE PRIVATE LIMITED</h3> 
                        <p>K-20, LAJPAT NAGAR - II, NEW DELHI -110024
                            <br>CIN : U72900DL2015PTC279705
                            <br>DELHI-110024</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
          
              <tr class="information">
                <td colspan="4">
                  <table>
                    <tr>
                      <td>
                        <b>GST No</b> : <b>07AAGCB2654J1ZM</b><br>
                        <b>Invoice No</b> :  ${invoice_no}<br>
                        <b>Invoice Date</b> : ${invoice_date}
                      </td>
          
                      <td style="text-align:left;">
                       <b>Reverse Charge</b> : Not Applicable<br>
                       <b>Place of Supply</b> : ${supply_place}<br>
                       <b>Date of Supply</b> : ${supply_date}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
          
              <tr class="heading">
                <td >
                    <b>Billing Details</b>
                </td>
          
                <td colspan="3" style="text-align: left;">  
                  <b>Shipping Details</b>
                </td>
              </tr>
          
              <tr class="details">
                <td>
                  <b>Party Name : </b>${party_name}<br>
                  <b>& Address : </b>${party_address}<br>
                  <b>GST No : </b> Not Applicable
                </td>
          
                <td colspan="3" style="text-align: left;">
                    <b>Party Name : </b> ${party_name}<br>
                    <b>& Address : </b>${party_address}<br>
                    <b>GST No : </b> Not Applicable
                </td>
              </tr>
            </table>

            <table>
                <tr class="table-list">
                <th style="border-left: 1px solid #000;   text-align: center;"></th>
                <th style="  text-align: center;"></th>
                <th style="  text-align: center;"></th>
                <th style="  text-align: center;"></th>
                <th style="  text-align: center;"></th>
                <th style="  text-align: center;"></th>
                
                <th style="border-right: 1px solid #000;  text-align: center;"></th>
                <th style="  text-align: center;"></th>         
                <th style="  text-align: center; ">
                    
                </th>
                <th style="  text-align: center;"></th>
          
                <th style=" text-align: center;">
                  GST
                </th>
                <th style="  text-align: center;"></th>
          
                <th style="border-right: 1px solid #000;  text-align: center;">
                    
                </th>
              </tr>
              <tr class="table-list">
                    <th colspan="1" style="border-right:1px solid #000;border-left: 1px solid #000;  text-align: center;"> 
                     S.no.
                    </th>
              
                    <th style="border-right:1px solid #000; text-align: center;">
                        Description of Item
                    </th>
              
                    <th style="border-right:1px solid #000; text-align: center;">
                        HSN
                        Code
                    </th>
                    <th style="border-right:1px solid #000; text-align: center;">
                        QTY
                    </th>
                    
                    <th style="border-right:1px solid #000; text-align: center;">
                        Rate
                    </th>
                    <th style="border-right:1px solid #000; text-align: center;">
                        Amount
                    </th>
                    <th style="border-right:1px solid #000; text-align: center;">
                        Disc
                    </th>

                    <th style=" text-align: center;">
                        
                    </th> <th style=" text-align: center;">
                        Rate
                    </th>

                    <th style="border-right:1px solid #000; text-align: center;">
                        
                    </th>
                    <th style=" text-align: center;">
                        
                    </th>

                    <th style=" text-align: center;">
                        Amount
                    </th>
                    <th style="border-right:1px solid #000; text-align: center;"">
                        
                    </th>
                  </tr>

                  <tr class="table-list">
                    <td colspan="1" style="border-right:1px solid #000;border-left: 1px solid #000;  text-align: center;"> 
                     1
                    </td>
              
                    <td style="border-right:1px solid #000; text-align: center;">
                        ${desc_item}
                    </td>
              
                    <td style="border-right:1px solid #000; text-align: center;">
                       ${hsn}
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;">
                        ${qty}
                    </td>
                    
                    <td style="border-right:1px solid #000; text-align: center;">
                        ${prod_rate}
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;">
                    ${prod_amount}
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;">
                    
                    </td>

                    <td style=" text-align: center;">
                        
                    </td> <td style=" text-align: center;">
                        
                    </td>

                    <td style="border-right:1px solid #000; text-align: center;">
                        
                    </td>
                    <td style=" text-align: center;">
                        
                    </td>

                    <td style=" text-align: center;">
                        
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;"">
                        
                    </td>
                  </tr>
                  <!--SplitHere-->
                  <tr class="table-list">
                    <td colspan="1" style=" text-align: center;border-left: 1px solid #000; "> 
                     
                    </td>
              
                    <td style=" text-align: center;">
                       
                    </td>
              
                    <td style=" text-align: center;">
                       
                    </td>
                    <td style=" text-align: center;">
                        
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;">
                    
                    </td>
                   
                    <td style="border-right:1px solid #000; text-align: center;">
                    ${
                      order.cart.totalPrice
                    } <small><strong>(inc. GST)</strong><small>
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;">
                    ${prod_disc}
                    </td>

                    <td style=" text-align: center;">
                        
                    </td> <td style=" text-align: center;">
                    18%
                    </td>

                    <td style="border-right:1px solid #000; text-align: center;">
                        
                    </td>
                    <td style=" text-align: center;">
                    
                    </td>

                    <td style=" text-align: center;">
                    ${tax_amount}
                    </td>
                    <td style="border-right:1px solid #000; text-align: center;"">
                        
                    </td>
                  </tr>
            </table>
            <table>
            <tr class="total">
            <td colspan="4"></td>              
            <td colspan="4">
              <b>Delivery Charges:</b>
               ${del_charges}
            </td>
            <td colspan="4"></td>
          </tr>

        <tr class="total">
            <td colspan="4"></td>              
            <td colspan="4">
              <strong>Delivery Tax Amount:</strong> ${del_tax}
            </td>
            <td colspan="4"></td>
          </tr>

                 <tr>
                    <td colspan="4">
                    </td>
                    <td colspan="4">
                    
                      </td>
                      <td colspan="4"></td>
                  </tr>

                  <tr class="total"></tr>
                  <tr class="total"></tr>
                  <tr class="total"></tr>
                  <tr class="total">
                    <td colspan="4">
                    <strong>Narration:</strong> Not Applicable
                    </td>              
                    <td colspan="4">
                      <strong>Bill Amount:</strong> ${net_payable}
                    </td>
                    <td colspan="4"></td>
                  </tr>
                  <tr class="total">
                  <td><b>Amount in Words: </b><strong>Rs. ${converter
                    .toWords(net_payable)
                    .toUpperCase()}</strong> Only</td>
                </tr>
                <tr class="total">
                    <td><b>Certified that the Particulars given above are true and correct</b></td>
                  </tr>
            </table>
            <hr>
            <table>
                <tbody>
                    <tr class="total">
                        <td>
                        <b>Terms & Conditions</b></td>
                        </tr>
                        <tr>
                                <td style="font-size:6px;">These terms and conditions along with your Invoice constitute the entire contract between you &amp; BESMARTY
                                TECHNOLOGIES PRIVATE LIMITED.<br>Goods once sold shall not be exchanged, replaced or taken back.<br>BESMARTY does not follow a replacement policy, DOA products shall be governed by the policies of respective
                                brands and replacement (if any) shall be made at the sole discretion of the respective brand. We will only help to
                                facilitate the process. Please contact your nearest store for more details.<br>BESMARTY bears no liability for any defect and / or deficiency in the Products and / or Services Sold. For any
                                Product defect and / or deficiency in services, buyer to contact the Manufacturer and / or the Service Provider.<br>The buyer acknowledges that the product(s) / service(s) purchased under this invoice are not for re-sale.<br>The risk of loss or destruction of, or damage to, the product shall pass onto you after the delivery of the product
                                to you. 7.Prices prevailing at the time of delivery shall be applicable.<br>Payments made by the way of credit card are acceptable, subject to realization of payment by Bank.<br>
                                Any or all grievances / disputes shall be exclusively subjected to the Jurisdiction of Courts at Delhi / New
                                Delhi.<br>Free gifts shall not be exchanged or covered under any kind of waranty</td>
                        </tr>
                        <tr>
                        <td></td>
                          <td>For BESMARTY MARKETPLACE PRIVATE LIMITED</td>
                               
                        </tr>
                        <tr style="height:70px"></tr>
                        <tr>
                            <td><b>This is computer generated Invoice not required Signature.</b></td>
                            <td><b>Authorised Signatory</b></td>
                        </tr>
    
                </tbody>
            </table>
          </div>
    </body>
    </html>`;

          if (order.cart.cartItems.length > 1) {
            for (var i = 1; i < order.cart.cartItems.length; i++) {
              desc_item = order.cart.cartItems[i].package.name;
              qty = 1;
              prod_rate = order.cart.cartItems[i].price;
              prod_amount = order.cart.cartItems[i].price;
              let splitString = `<tr class="table-list">
        <td colspan="1" style="border-right:1px solid #000;border-left: 1px solid #000;  text-align: center;"> 
         ${i + 1}
        </td>
  
        <td style="border-right:1px solid #000; text-align: center;">
            ${desc_item}
        </td>
  
        <td style="border-right:1px solid #000; text-align: center;">
           ${hsn}
        </td>
        <td style="border-right:1px solid #000; text-align: center;">
            ${qty}
        </td>
        
        <td style="border-right:1px solid #000; text-align: center;">
            ${prod_rate}
        </td>
        <td style="border-right:1px solid #000; text-align: center;">
        ${prod_amount}
        </td>
        <td style="border-right:1px solid #000; text-align: center;">
       
        </td>

        <td style=" text-align: center;">
                        
        </td> <td style=" text-align: center;">
            
        </td>

        <td style="border-right:1px solid #000; text-align: center;">
            
        </td>
        <td style=" text-align: center;">
            
        </td>

        <td style=" text-align: center;">
            
        </td>
        <td style="border-right:1px solid #000; text-align: center;"">
            
        </td>
      </tr>`;
              let spl = htmlString.split("<!--SplitHere-->");
              htmlString = spl[0] + splitString + "<!--SplitHere-->" + spl[1];
            }
          }

          fs.writeFileSync(
            __dirname + "/invoice_" + invoice_no + ".html",
            htmlString,
            err => {
              if (err) {
                throw err;
              }
            }
          );

          var html = fs.readFileSync(
            __dirname + "/invoice_" + invoice_no + ".html",
            "utf8"
          );
          var options = {
            format: "Legal",
            border: {
              top: "0.1in",
              right: "0.2in",
              bottom: "0.1in",
              left: "0.2in"
            }
          };

          function createPDF() {
            return new Promise((resolve, reject) => {
              pdf.create(html, options).toBuffer(function(err, Buffer) {
                if (err) reject(err);
                else {
                  resolve(Buffer);
                }
              });
            });
          }

          createPDF()
            .then(Buffer => {
              fs.unlink(__dirname + "/invoice_" + invoice_no + ".html", err => {
                if (err) throw err;
              });
              res.set({
                "Content-Disposition":
                  "attachment; filename=invoice_" + invoice_no + ".pdf",
                "Content-Type": "application/pdf; charset=utf-8"
              });
              res.write(Buffer);
              res.end();
            })
            .catch(err =>
              res.json({
                status: "false",
                message: "Invoice could not be generated"
              })
            );
        }
      })
      .catch(err =>
        res.json({
          status: "false",
          message: "Please provide Order Id"
        })
      );
  });
};
