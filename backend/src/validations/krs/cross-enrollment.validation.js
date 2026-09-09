'use strict';
const Joi=require('joi');const {idParam,listQuery}=require('../common');
const enroll=Joi.object({penawaran_matakuliah_id:Joi.string().uuid().required(),kelas_id:Joi.string().uuid().required()});
const decision=Joi.object({approved:Joi.boolean().required(),reason:Joi.when('approved',{is:false,then:Joi.string().min(3).max(1000).required(),otherwise:Joi.string().allow('',null)})});
const list=listQuery(['cross_enrollment_status','createdAt'],['cross_enrollment_status','kelas_id','krs_id']);
module.exports={enroll,decision,list,idParam};
