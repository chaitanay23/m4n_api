// const formidable = require('formidable');
// const Product = require('../../models/product');
// const fs = require('fs');
// var path = require('path');

// exports.create=(req,res) => {
//     new formidable.IncomingForm().parse(req, (err, fields,files) => {
//         if (err) {
//           console.error('Error', err)
//           throw err
//         }
//         const display_name = fields["name"];
//         const price = fields["price"];
//         const quantity = fields["quantity"];
//         const product_code = fields["product_code"];
//         const product_type = fields["product_type"];
//         const desc = fields["description"];
//         function image_upload(){
//             if(files.image != null)
//             {
//                 if(files.image.type == 'image/jpeg' || 'image/png')
//                 {
//                     var extention = path.extname(files.image.name);
//                     var old_path = files.image.path;
//                     var new_path = './uploads/'+ display_name+'_'+product_code+extention;
//                     fs.rename(old_path,new_path,(err)=>{
//                         if(err) throw err;
//                         else console.log('Successfully moved');
//                     });
//                     db_path = new_path.slice(1,new_path.length);

//                     return (db_path);
//                 }
//             }
//         }
//         img = image_upload();

//         Product.create({
//             name:display_name,
//             price:price,
//             quantity:quantity,
//             product_code:product_code,
//             product_type:product_type,
//             description:desc,
//             image:img
//         })
//         .then(result => {
//             res.send(JSON.stringify({message:"Product added sucessfully"}));
//         })
//         .catch(err=>{
//             res.send(JSON.stringify({error:err}));
//         })
//     });
// }
