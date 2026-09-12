'use strict';
const Joi=require('joi');const {listQuery}=require('../common');
const enroll=Joi.object({penawaran_matakuliah_id:Joi.string().uuid().required(),kelas_id:Joi.string().uuid().required()});
const list=listQuery(['cross_enrollment_status','createdAt'],['cross_enrollment_status','kelas_id','krs_id']);
module.exports={enroll,list};
