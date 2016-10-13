/*
	estudi per empuriabrava 2016 tarifa 3 mes d'abril
*/

//crear funcio "include"
var fs = require("fs");
function read(f){return fs.readFileSync(f).toString();}
function include(f){eval.apply(global,[read(f)]);}

//arxius necessaris: classess, funcions i tarifa
include('../bin/classes.js');include('../bin/funcions.js');include('../bin/tarifa3.js')

//Info necessària
// 1. tarifa
// 2. tipus: Array d'objectes de la classe Tipus
// 3. weekmod: número enter. és l'index del tipus que defineix els caps de setmana i festius (en aquest cas el tipus 5) 
// 4. tint: 1 ò 0.25 (hores). Vol dir que tenim una dada de potència (kW) cada hora (1) o cada quart d'hora (0.25)
// 5. festius: Array d'objectes de la classe DiaFestiu
// 6. canvisHoraris: interval on s'aplica GMT+1. Array d'objectes de la classe CanviHorari
// 8. impostos: números

//PERÍODE
periodes=new Array();periodes.push(new Periode(1,new Date(Date.UTC(2016,set,01)),new Date(Date.UTC(2016,oct,01))))
festius.push(new DiaFestiu(new Date(Date.UTC(2016,abr,23)),"Sant Jordi"));

tarifa=3
tipus.push(new Tipus(3,3,3,3,3,3,3,3,2,2,2,2,2,2,2,2,2,1,1,1,1,1,1,2))//tipus0
tipus.push(new Tipus(3,3,3,3,3,3,3,3,2,2,1,1,1,1,1,1,2,2,2,2,2,2,2,2))//tipus1
tipus.push(new Tipus(3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,3,2,2,2,2,2,2))//tipus2(weekmod)
weekmod=2
tint=1
potConP1=290 
potConP2=290 
potConP3=290  	
eurKWhP1=0.092413
eurKWhP2=0.082492
eurKWhP3=0.059532
eurKWP1 =4.931122
eurKWP2 =3.040891
eurKWP3 =0.697311
tax_alq =29.53
tax_iva =0.21
tax_im1 =0.04864 //impostos 1
tax_im2 =1.05113 //impostos 2

//corba horària de càrrega. 30 dies = 720 dades
energy=[
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	245,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
	0,
];
calcula()[0]
