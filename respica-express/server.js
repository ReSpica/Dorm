var express = require('express');
const bodyParser = require('body-parser');
// const mongoose = require('mongoose');
const fs = require('fs');
var multer = require('multer');


var app = express();
app.set('views','./public/respica3');
app.set('view engine','ejs');
app.use(express.static('public'));//静态文件目录设置（放后台前端）
app.use(express.static('upload'));//静态文件目录设置（放图片）
app.use(bodyParser.urlencoded({extended:false}));//解析表单
app.use(require('cors')());//解决跨域问题
// mongoose.connect('mongodb://localhost:27017/respica-express',{useUnifiedTopology: true,useNewUrlParser: true});//链接数据库

//管理员页路由设置1
var loginRouter = require('./routes/00-login');
var schoolruleRouter = require('./routes/01-schoolrule');
var adminRouter = require('./routes/02-admin');
var dormRouter = require('./routes/03-dorm');
var studentRouter = require('./routes/04-student');
var weRouter = require('./routes/05-we');
var repairRouter = require('./routes/06-repair');
var noticeRouter = require('./routes/07-notice');
var statisticsRouter = require('./routes/08-statistics');
//舍监页路由设置1
var b_loginRouter = require('./routes/build_admin/00-login');
var b_adminRouter = require('./routes/build_admin/01-admin');
var b_notice1Router = require('./routes/build_admin/02-notice');
var b_studentRouter = require('./routes/build_admin/03-student');
var b_weRouter = require('./routes/build_admin/04-we');
var b_noticeRouter = require('./routes/build_admin/05-notice');
//学生页路由设置1
var s_loginRouter = require('./routes/student/00-login');
var s_adminRouter = require('./routes/student/01-admin');
var s_noticeRouter = require('./routes/student/02-notice');
var s_weRouter = require('./routes/student/03-we');
var s_repairRouter = require('./routes/student/04-repair');
//管理员页路由设置2
app.use('/api/login',loginRouter);
app.use('/api/schoolrule',schoolruleRouter);
app.use('/api/admin',adminRouter);
app.use('/api/dorm',dormRouter);
app.use('/api/student',studentRouter);
app.use('/api/we',weRouter);
app.use('/api/repair',repairRouter);
app.use('/api/notice',noticeRouter);
app.use('/api/statistics',statisticsRouter);
//舍监页路由设置2
app.use('/api2/login',b_loginRouter);
app.use('/api2/admin',b_adminRouter);
app.use('/api2/notice1',b_notice1Router);
app.use('/api2/student',b_studentRouter);
app.use('/api2/we',b_weRouter);
app.use('/api2/notice',b_noticeRouter);
//学生页路由设置2
app.use('/api3/login',s_loginRouter);
app.use('/api3/admin',s_adminRouter);
app.use('/api3/notice',s_noticeRouter);
app.use('/api3/we',s_weRouter);
app.use('/api3/repair',s_repairRouter);

app.listen(2333,()=>{
    console.log('服务器已启动，端口号为：2333')
})