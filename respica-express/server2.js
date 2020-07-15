var express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const fs = require('fs');
var multer = require('multer');


var app = express();
app.use(bodyParser.urlencoded({extended:false}));//解析表单
app.use(require('cors')());//解决跨域问题
mongoose.connect('mongodb://localhost:27017/respica-express',{useUnifiedTopology: true,useNewUrlParser: true});//链接数据库
var createFolder = function(folder){ //检测是否创建过目录
    try{
        fs.accessSync(folder);
    }catch(e){
        fs.mkdirSync(folder);
    }
}
var uploadFolder = './upload/';//设置下载地址
createFolder(uploadFolder);//把设置的地址给上面的方法进行检测


var storage = multer.diskStorage({//前面两部都为multer的diskStorage服务
    destination:function(req,file,cb){
        cb(null,uploadFolder);
    },
    filename:function(req,file,cb){
        //cb(null,file.fieldname + '-' + Date.now());
        cb(null,file.originalname);
    }
})
var upload = multer({storage:storage})//文件上传






app.get('/',(req,res)=>{
    console.dir(req.query);
    res.send('ok')
})

app.post('/',(req,res)=>{
    console.dir(req.body);
    res.send('ok')
})

app.get('/form',(req,res)=>{
    // res.sendFile(__dirname + '/form.html');
    res.render('form',{person:person});
})
app.post('/upload',upload.single('logo'),(req,res)=>{
    console.log(req.file)
    res.send('上传成功');
})

app.listen(2333,()=>{
    console.log('服务器已启动，端口号为：2333')
})