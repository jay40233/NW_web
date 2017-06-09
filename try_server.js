var express = require('express'),
    app = express();
var port = 3000;
var logger = require('morgan');
var fs = require('fs');
var fileUpload = require('express-fileupload');

app.use(logger('dev'));
app.use(fileUpload());

app.use(function (req, res, next) {
  console.log('Time:', Date.now());
  console.log('Main page loaded');
  next();
});
 
app.get('/', function(req, res){
    res.sendFile(__dirname + '/index.html');
});

app.post('/callNW', function(req, res) {
  var ThreeToOne = {'ALA':'A','CYS':'C','ASP':'D','GLU':'E','PHE':'F','GLY':'G','HIS':'H','ILE':'I','LYS':'K','LEU':'L','MET':'M',
              'ASN':'N','PRO':'P','GLN':'Q','ARG':'R','SER':'S','THR':'T','VAL':'V','TRP':'W','TYR':'Y'};
  var score_matrix = {'A': {'A': 4,'R':-1,'N':-2,'D':-2,'C': 0,'Q':-1,'E':-1,'G': 0,'H':-2,'I':-1,'L':-1,'K':-1,'M':-1,'F':-2,'P':-1,'S': 1,'T': 0,'W':-3,'Y':-2,'V': 0},
                    'R': {'A':-1,'R': 5,'N': 0,'D':-2,'C':-3,'Q': 1,'E': 0,'G':-2,'H': 0,'I':-3,'L':-2,'K': 2,'M':-1,'F':-3,'P':-2,'S':-1,'T':-1,'W':-3,'Y':-2,'V':-3}, 
                    'N': {'A':-2,'R': 0,'N': 6,'D': 1,'C':-3,'Q': 0,'E': 0,'G': 0,'H': 1,'I':-3,'L':-3,'K': 0,'M':-2,'F':-3,'P':-2,'S': 1,'T': 0,'W':-4,'Y':-2,'V':-3}, 
                    'D': {'A':-2,'R':-2,'N': 1,'D': 6,'C':-3,'Q': 0,'E': 2,'G':-1,'H':-1,'I':-3,'L':-4,'K':-1,'M':-3,'F':-3,'P':-1,'S': 0,'T':-1,'W':-4,'Y':-3,'V':-3}, 
                    'C': {'A': 0,'R':-3,'N':-3,'D':-3,'C': 9,'Q':-3,'E':-4,'G':-3,'H':-3,'I':-1,'L':-1,'K':-3,'M':-1,'F':-2,'P':-3,'S':-1,'T':-1,'W':-2,'Y':-2,'V':-1}, 
                    'Q': {'A':-1,'R': 1,'N': 0,'D': 0,'C':-3,'Q': 5,'E': 2,'G':-2,'H': 0,'I':-3,'L':-2,'K': 1,'M': 0,'F':-3,'P':-1,'S': 0,'T':-1,'W':-2,'Y':-1,'V':-2}, 
                    'E': {'A':-1,'R': 0,'N': 0,'D': 2,'C':-4,'Q': 2,'E': 5,'G':-2,'H': 0,'I':-3,'L':-3,'K': 1,'M':-2,'F':-3,'P':-1,'S': 0,'T':-1,'W':-3,'Y':-2,'V':-2}, 
                    'G': {'A': 0,'R':-2,'N': 0,'D':-1,'C':-3,'Q':-2,'E':-2,'G': 6,'H':-2,'I':-4,'L':-4,'K':-2,'M':-3,'F':-3,'P':-2,'S': 0,'T':-2,'W':-2,'Y':-3,'V':-3}, 
                    'H': {'A':-2,'R': 0,'N': 1,'D':-1,'C':-3,'Q': 0,'E': 0,'G':-2,'H': 8,'I':-3,'L':-3,'K':-1,'M':-2,'F':-1,'P':-2,'S':-1,'T':-2,'W':-2,'Y': 2,'V':-3}, 
                    'I': {'A':-1,'R':-3,'N':-3,'D':-3,'C':-1,'Q':-3,'E':-3,'G':-4,'H':-3,'I': 4,'L': 2,'K':-3,'M': 1,'F': 0,'P':-3,'S':-2,'T':-1,'W':-3,'Y':-1,'V': 3}, 
                    'L': {'A':-1,'R':-2,'N':-3,'D':-4,'C':-1,'Q':-2,'E':-3,'G':-4,'H':-3,'I': 2,'L': 4,'K':-2,'M': 2,'F': 0,'P':-3,'S':-2,'T':-1,'W':-2,'Y':-1,'V': 1}, 
                    'K': {'A':-1,'R': 2,'N': 0,'D':-1,'C':-3,'Q': 1,'E': 1,'G':-2,'H':-1,'I':-3,'L':-2,'K': 5,'M':-1,'F':-3,'P':-1,'S': 0,'T':-1,'W':-3,'Y':-2,'V':-2}, 
                    'M': {'A':-1,'R':-1,'N':-2,'D':-3,'C':-1,'Q': 0,'E':-2,'G':-3,'H':-2,'I': 1,'L': 2,'K':-1,'M': 5,'F': 0,'P':-2,'S':-1,'T':-1,'W':-1,'Y':-1,'V': 1}, 
                    'F': {'A':-2,'R':-3,'N':-3,'D':-3,'C':-2,'Q':-3,'E':-3,'G':-3,'H':-1,'I': 0,'L': 0,'K':-3,'M': 0,'F': 6,'P':-4,'S':-2,'T':-2,'W': 1,'Y': 3,'V':-1}, 
                    'P': {'A':-1,'R':-2,'N':-2,'D':-1,'C':-3,'Q':-1,'E':-1,'G':-2,'H':-2,'I':-3,'L':-3,'K':-1,'M':-2,'F':-4,'P': 7,'S':-1,'T':-1,'W':-4,'Y':-3,'V':-2}, 
                    'S': {'A': 1,'R':-1,'N': 1,'D': 0,'C':-1,'Q': 0,'E': 0,'G': 0,'H':-1,'I':-2,'L':-2,'K': 0,'M':-1,'F':-2,'P':-1,'S': 4,'T': 1,'W':-3,'Y':-2,'V':-2}, 
                    'T': {'A': 0,'R':-1,'N': 0,'D':-1,'C':-1,'Q':-1,'E':-1,'G':-2,'H':-2,'I':-1,'L':-1,'K':-1,'M':-1,'F':-2,'P':-1,'S': 1,'T': 5,'W':-2,'Y':-2,'V': 0}, 
                    'W': {'A':-3,'R':-3,'N':-4,'D':-4,'C':-2,'Q':-2,'E':-3,'G':-2,'H':-2,'I':-3,'L':-2,'K':-3,'M':-1,'F': 1,'P':-4,'S':-3,'T':-2,'W':11,'Y': 2,'V':-3}, 
                    'Y': {'A':-2,'R':-2,'N':-2,'D':-3,'C':-2,'Q':-1,'E':-2,'G':-3,'H': 2,'I':-1,'L':-1,'K':-2,'M':-1,'F': 3,'P':-3,'S':-2,'T':-2,'W': 2,'Y': 7,'V':-1}, 
                    'V': {'A': 0,'R':-3,'N':-3,'D':-3,'C':-1,'Q':-2,'E':-2,'G':-3,'H':-3,'I': 3,'L': 1,'K':-2,'M': 1,'F':-1,'P':-2,'S':-2,'T': 0,'W':-3,'Y':-1,'V': 4}};

  if (!req.files)
    return res.status(400).send('No files were uploaded.');
  var sequence1,sequence2;
  if(req.files.hasOwnProperty("aupfile")){
	 var f1 = req.files.aupfile.name; 
	 var f1_data = String(req.files.aupfile.data);
	 f1_data = f1_data.split('\n');
	 sequence1 = readPDB(f1_data);
  }
  else{
	 sequence1 = req.body.asequence;
  }
  if(req.files.hasOwnProperty("bupfile")){
	 var f2 = req.files.bupfile.name  
	 var f2_data = String(req.files.bupfile.data);
	 f2_data = f2_data.split('\n');
	 sequence2 = readPDB(f2_data);
  }
  else{
	 sequence2 = req.body.bsequence;
  }
  //console.log("File1 name: " + f1);
  //console.log("File2 name: " + f2);
function readPDB(array_data){
  var res_index = 0;
  var sequence = "";
  for(var line= 0 ;line<array_data.length;line++){
    temp = array_data[line].split(/[\s,]+/);
    if(temp[0]=='ATOM' && Number(temp[5]) !== res_index){
        sequence += ThreeToOne[temp[3]];
        res_index = Number(temp[5]);
    }
  }
  return sequence
}


function initial_table(){
  var array = [], row = [];
  var cols = Lb+1;
  var rows = La+1;
  while (cols--) row.push(0);
  while (rows--) array.push(row.slice());
  return array;
}
function Needleman(){
    for(var j=0;j<Lb+1;j++){
      table[0][j] = j*(-8);
    }
    for(var i=0;i<La+1;i++){
      table[i][0] = i*(-8);
    }
    for(var i=1;i<La+1;i++){
      for(var j=1;j<Lb+1;j++){
        table[i][j] = Math.max(table[i][j-1]-8,table[i-1][j]-8,table[i-1][j-1]+score_matrix[str1[i-1]][str2[j-1]]);
      }
    }
}
function TraceBack(i,j){
    if(i===0 && j===0){
      var buff_copy = buff.slice();        //The buff is gonna store the route that has been traced so far
      backtrace.push(buff_copy);           //If it hits the origin, means this trace has been done. Append it to the final output.
      if(check_point.length!==0){
        var temp = check_point[check_point.length-1];       //And pop out the last recorded split-point, if any
        check_count[check_count.length-1] -= 1;
        if(check_count[check_count.length-1] === 0){
          check_point = check_point.splice(check_point.length-1, 1);
          check_count = check_count.splice(check_count.length-1, 1);
        }
        buff = temp.slice();
      }
      return 0;
    }
    else if(i ===0){
      buff.push([i,j-1]);
      TraceBack(i,j-1);
    }
    else if(j ===0){
      buff.push([i-1,j]);
      TraceBack(i-1,j);
    }
    else{
      if(((table[i-1][j]-8 === table[i][j]) + (table[i][j-1]-8 === table[i][j]) +(table[i-1][j-1]+score_matrix[str1[i-1]][str2[j-1]] === table[i][j]))>=2){
        var count = ((table[i-1][j]-8 === table[i][j]) + (table[i][j-1]-8 === table[i][j]) +(table[i-1][j-1]+score_matrix[str1[i-1]][str2[j-1]] === table[i][j]));
        var temp = buff.slice();
        check_point.push(temp);
        check_count.push(count-1);
      }
      if(table[i-1][j]-8 === table[i][j]){
        buff.push([i-1,j]);
        TraceBack(i-1,j);
      }
      if(table[i][j-1]-8 === table[i][j]){
        buff.push([i,j-1]);
        TraceBack(i,j-1);
      }
      if(table[i-1][j-1]+score_matrix[str1[i-1]][str2[j-1]] === table[i][j]){
        buff.push([i-1,j-1]);
        TraceBack(i-1,j-1);
      }
    }
}

function getIdentity(alignments){
  var aln1 = alignments[0][0];
  var aln2 = alignments[0][1];
  var L = aln1.length;
  var iden = 0;
  for(var i=0;i<L;i++){
    if(aln1[i] === aln2[i]){
      iden +=1;
    }
  }
  console.log('The identity =  ' + (iden/L*100)+'%');
  return (iden/L*100)+'%'
}
function printAlignments(traces,a,b){
  var output = []
  for(var i=0;i<traces.length;i++){
    console.log("==================================");
    console.log("The Alignment:");
    var output_A = "";
    var output_B = "";
    var trace_t = traces[i].reverse();
    for(var j =1;j<trace_t.length;j++){
      if(trace_t[j][0]-trace_t[j-1][0] !==0){
        output_A += a[trace_t[j][0]-1];
      }
      else{
        output_A += "_";
      }
      if(trace_t[j][1]-trace_t[j-1][1] !=0){
        output_B += b[trace_t[j][1]-1];
      }
      else{
        output_B += "_";
      }
    }
    output.push([output_A, output_B]);
    console.log(output_A);
    console.log(output_B);
    console.log("Alignment length = " + output_A.length);
  }
  console.log("==================================");
  return output
}
var str1 = sequence1;
var str2 = sequence2;
var La = str1.length;
var Lb = str2.length;
var backtrace = [];
var buff = [[La,Lb]];
var check_point = [];
var check_count = [];
var table = initial_table();
Needleman();
TraceBack(La,Lb);
var align = printAlignments(backtrace,str1,str2);
var iden = getIdentity(align);
res.send('A seq is : ' + str1 + '<br />B seq is : '+ str2 + '<br />' + '<br />The final alignment is : '+ align + '<br />The sequence identity: '+ iden +'<br />');

});


app.listen(port, function(err,res){
	if(err){
		console.log('Server error');
	}else{
		console.log('Server running at localhost:'+port);
	}
});

