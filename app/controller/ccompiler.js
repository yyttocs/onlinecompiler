var exec  = require('child_process').exec;
var fs = require('fs');
var cuid = require('cuid');
var colors = require('colors');
var shell = require('shelljs')
var async = require('async')

exports.stats = false ;

var TEST_FOLDER = '/home/ec2-user/onlinecompiler/temp/';
var CbuildCompileCmd = function (filename) {
    return "sudo docker run -w=/usr/compiler -t -v=/home/ec2-user/onlinecompiler/temp/:/usr/compiler/:rw " + "c8bded43e9e6" + " " + 'gcc ' + filename +'.cpp -o '+ filename +'.out'  ;
};
var CbuildRunCmd = function (filename) {
    return "sudo docker run -w=/usr/compiler -t -v=/home/ec2-user/onlinecompiler/temp/:/usr/compiler/:rw " + "c8bded43e9e6" + " timeout 5s " + './' + filename + '.out';
};
exports.stats = false ;


exports.compileCPP = function ( envData ,  code , fn ) { 
            //creating source file
            var filename = cuid.slug();
            path = TEST_FOLDER
                 

            //create temp0 
            fs.writeFile( path  +  filename +'.cpp' , code  , function(err ){           
                if(exports.stats)
                {
                    if(err)
                    console.log('ERROR: '.red + err);
                    else
                    console.log('INFO: '.green + filename +'.cpp created'); 
                }
            });

            //compiling and exrcuiting source code
            //compile c code 

            //commmand = 'gcc ' + path + filename +'.cpp -o '+ path + filename+'.out' ;
            shell.exec(CbuildCompileCmd , function ( error , stdout , stderr ){  
                if(error)
                {
                    if(exports.stats)
                    {
                        console.log('INFO: '.green + filename + '.cpp contained an error while compiling');
                    }
                    var out = { error : stderr};
                    fn(out);
                }
                else
                {
                    shell.exec(CbuildRunCmd(filename), function ( error , stdout , stderr ){
                        if(error)
                        {
                        if(error.toString().indexOf('Error: stdout maxBuffer exceeded.') != -1)
                            {
                                var out = { error : 'Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.' };
                                fn(out);
                            }
                        else
                            {
                                if(exports.stats)
                                    {
                                        console.log('INFO: '.green + filename + '.cpp contained an error while executing');
                                    }
                                var out = { error : stderr };
                                fn(out);
                            }                                                   
                        }
                        else
                        {
                            if(exports.stats)
                            {
                                console.log('INFO: '.green + filename + '.cpp successfully compiled and executed !');
                            }
                            var out = { output : stdout};
                            fn(out);
                        }
                    });

                }           
            });
           }                                        
} //end of compileCPP

exports.compileCPPWithInput = function ( envData , code , input ,  fn ) { 
    var filename = cuid.slug();
    path = './temp/';
                 
    //create temp0 
    fs.writeFile( path  +  filename +'.cpp' , code  , function(err ){
        if(exports.stats)
        {
            if(err)
            console.log('ERROR: '.red + err);
            else
            console.log('INFO: '.green + filename +'.cpp created');
        } 
    });

    if(envData.OS === 'windows' || envData.cmd ==='g++')
        {               

            //compile c code 
            commmand = 'g++ ' + path + filename +'.cpp -o '+ path + filename+'.exe' ;
            exec(commmand , function ( error , stdout , stderr ){  
                if(error)
                {
                    if(exports.stats)
                    {
                        console.log('INFO: '.green + filename + '.cpp contained an error while compiling');
                    }
                    var out = { error : stderr };
                    fn(out);
                }
                else
                {
                    if(input){
                        var inputfile = filename + 'input.txt';

                        fs.writeFile( path  +  inputfile , input  , function(err ){
                            if(exports.stats)
                            {
                                if(err)
                                    console.log('ERROR: '.red + err);
                                else
                                    console.log('INFO: '.green + inputfile +' (inputfile) created');
                            }
                        });
                        var tempcommand = "cd temp & " + filename ;

                        exec( tempcommand + '<' + inputfile , function( error , stdout , stderr ){
                        if(error)
                        {
                        if(error.toString().indexOf('Error: stdout maxBuffer exceeded.') != -1)
                            {
                                var out = { error : 'Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.'};
                                fn(out);
                            }
                        else
                            {
                                if(exports.stats)
                                    {
                                        console.log('INFO: '.green + filename + '.cpp contained an error while executing');
                                    }
                                var out = { error : stderr};
                                fn(out);
                            }                                                                               
                        }
                        else
                        {
                            if(exports.stats)
                            {
                                console.log('INFO: '.green + filename + '.cpp successfully compiled and executed !');
                            }
                            var out = { output : stdout};
                            fn(out);
                        }
                        });

                    }
                    else //input not provided 
                    {
                        if(exports.stats)
                        {
                            console.log('INFO: '.green + 'Input mission for '+filename +'.cpp');
                        }
                        var out = { error : 'Input Missing' };
                        fn(out);
                    }
                    
                }
            

            });
                                        
        }
    else            
        {
                        //compile c code 
            commmand = 'gcc ' + path + filename +'.cpp -o '+ path + filename+'.out' ;
            exec(commmand , function ( error , stdout , stderr ){  
                if(error)
                {
                    if(exports.stats)
                    {
                        console.log('INFO: '.green + filename + '.cpp contained an error while compiling');
                    }
                    var out = { error : stderr};
                    fn(out);
                }
                else
                {
                    if(input){
                        var inputfile = filename + 'input.txt';

                        fs.writeFile( path  +  inputfile , input  , function(err ){
                            if(exports.stats)
                            {
                                if(err)
                                    console.log('ERROR: '.red + err);
                                else
                                    console.log('INFO: '.green + inputfile +' (inputfile) created');
                            }
                        });

                        exec( path + filename +'.out' + ' < ' + path + inputfile , function( error , stdout , stderr ){
                        if(error)
                        {

                        if(error.toString().indexOf('Error: stdout maxBuffer exceeded.') != -1)
                            {
                                var out = { error : 'Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.'};
                                fn(out);
                            }
                        else
                            {
                                if(exports.stats)
                                {
                                    console.log('INFO: '.green + filename + '.cpp contained an error while executing');
                                }
                                var out =  { output : stderr};
                                fn(out);
                            }                                                                               
                        }
                        else
                        {
                            if(exports.stats)
                            {
                                console.log('INFO: '.green + filename + '.cpp successfully compiled and executed !');
                            }
                            var out = { output : stdout};
                            fn(out);
                        }
                        });

                    }
                    else //no input file
                    {
                        if(exports.stats)
                        {
                            console.log('INFO: '.green + 'Input mission for '+filename +'.cpp');
                        }
                        var out = { error : 'Input Missing' };
                        fn(out);
                    }
                    
                }
                
    
            });


        }                               
} //end of compileCPPWithInput
