const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/respica-express',{useUnifiedTopology: true,useNewUrlParser: true});//链接数据库

//用户表
const adminSchema = new mongoose.Schema({
    admin:{type:String},
    password:{type:String}
})
//用户表的虚拟字段（用于多表查询）
adminSchema.virtual('builds',{
    localField:'_id',//你用哪个字段给他关联的，(通常都是_id)
    ref:'build',//主动关联你的表(build)
    foreignField:'admin',//关联你的表中放你位置的字段
    justOne:false,//选择返回是对象还是数组
})
//宿舍表
const dormSchema = new mongoose.Schema({
    build:{type:mongoose.SchemaTypes.ObjectId,ref:'build'},
    dorm :{type:String},
    max :{type:Number},
    now:{type:Number},
    break:{type:Number}
})
//宿舍表的虚拟字段（用于多表查询）
dormSchema.virtual('wes',{
    localField:'_id',//你用哪个字段给他关联的，(通常都是_id)
    ref:'we',//主动关联你的表
    foreignField:'dorm',//关联你的表中放你位置的字段
    justOne:false,//选择返回是对象还是数组
})

//栋表
const buildSchema = new mongoose.Schema({
    admin:{type:mongoose.SchemaTypes.ObjectId,ref:'Admin'},
    build :{type:String},
    user :{type:String},
    phone :{type:String},
    password:{type:String},
    now:{type:Number},
    notice:{type:String}
})
//栋表的虚拟字段（用于多表查询）
buildSchema.virtual('dorms',{
    localField:'_id',//你用哪个字段给他关联的，(通常都是_id)
    ref:'dorm',//主动关联你的表(build)
    foreignField:'build',//关联你的表中放你位置的字段
    justOne:false,//选择返回是对象还是数组
})
//学号规则表
const idruleSchema = new mongoose.Schema({
    size :{type:Number},
    grade :{type:String},
    system :{type:String},
    class:{type:String},
    rank:{type:String}
})
//专业表
const systemSchema = new mongoose.Schema({
    num :{type:Number},
    system :{type:String},
})
//学生表
const studentSchema = new mongoose.Schema({
    sno :{type:Number},
    sname :{type:String},
    ssex :{type:Number},
    sphone :{type:String},
    spwd:{type:String},
    build :{type:mongoose.SchemaTypes.ObjectId,ref:'build'},
    dorm :{type:mongoose.SchemaTypes.ObjectId,ref:'dorm'},
    flag :{type:Number},
})
//维修员表
const repairmanSchema = new mongoose.Schema({
    rmname :{type:String},
    rmphone :{type:String},
    rmphoto:{type:String}
})
//水单标准表
const weRuleSchema = new mongoose.Schema({
    erelief :{type:Number},
    wrelief :{type:Number},
    efirst:{type:Number},
    esecond:{type:Number},
    ethird:{type:Number},
    wfirst:{type:Number},
    wsecond:{type:Number},
    wthird:{type:Number},
    et1:{type:Number},
    et2:{type:Number},
    wt1:{type:Number},
    wt2:{type:Number}
})
//公告表
const noticeSchema = new mongoose.Schema({
    admin:{type:mongoose.SchemaTypes.ObjectId,ref:'Admin'},
    flag:{type:Number},
    notice:{type:String},
    date:{type:Number}
})
//水电单
const weSchema = new mongoose.Schema({
    year:{type:Number},
    month:{type:Number},
    build:{type:mongoose.SchemaTypes.ObjectId,ref:'build'},
    dorm:{type:mongoose.SchemaTypes.ObjectId,ref:'dorm'},
    electric:{type:Number},
    water:{type:Number},
    efee:{type:Number},
    wfee:{type:Number},
    total:{type:Number},
    flag:{type:Number},
    sno:{type:String},
    phone:{type:Number}
})
//报修的类型
const typeSchema = new mongoose.Schema({
    type:{type:String}
})
//类型的虚拟字段（用于多表查询）
typeSchema.virtual('repair',{
    localField:'_id',//你用哪个字段给他关联的，(通常都是_id)
    ref:'repair',//主动关联你的表(build)
    foreignField:'type',//关联你的表中放你位置的字段
    justOne:false,//选择返回是对象还是数组
})

//报修单
const repairSchema = new mongoose.Schema({
    build:{type:mongoose.SchemaTypes.ObjectId,ref:'build'},
    dorm:{type:mongoose.SchemaTypes.ObjectId,ref:'dorm'},
    sno:{type:String},
    sphone:{type:Number},
    type:{type:mongoose.SchemaTypes.ObjectId,ref:'type'},
    photo:{type:String},
    flag:{type:Number},//是否维修
    time:{type:Number},
    repairman:{type:mongoose.SchemaTypes.ObjectId,ref:'repairman'},
    spay:{type:Number},
    dpay:{type:Number},
    flag2:{type:Number},//是否自费
    oktime:{type:Number},
    sremark:{type:String},//学生备注
    rremark:{type:String},//维修员备注
})

const Admin = mongoose.model('Admin',adminSchema);
const Dorm = mongoose.model('dorm',dormSchema);
const Build = mongoose.model('build',buildSchema);
const IdRule = mongoose.model('idrule',idruleSchema);
const System = mongoose.model('system',systemSchema);
const Student = mongoose.model('student',studentSchema);
const RepairMan = mongoose.model('repairman',repairmanSchema);
const WeRule = mongoose.model('werule',weRuleSchema);
const Notice = mongoose.model('notice',noticeSchema);
const We = mongoose.model('we',weSchema);
const RePair = mongoose.model('repair',repairSchema);
const Type = mongoose.model('type',typeSchema);




// async function main(){
//     const builds = await Build.find().populate('dorms').lean();
//     const buildsName = [];
//     var builds_now = [];
//     var builds_max = [];
//     builds.forEach(function(value,index,arr){
//         buildsName.push(value.build);
//         var now =0;
//         var max = 0;
//         value.dorms.forEach(function(value,index,arr){
//             now +=value.now;
//             max += value.max; 
//         });
//         builds_now.push(now);
//         builds_max.push(max);
//     })
// }
// main()








module.exports = {Admin,Dorm,Build,IdRule,System,Student,RepairMan,WeRule,Notice,We,RePair,Type}
