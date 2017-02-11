var exec  = require('child_process').exec;
var fs = require('fs');
var cuid = require('cuid');
var colors = require('colors');
var shell = require('shelljs')
var async = require('async')

exports.stats = false ;

var TEST_FOLDER = '/home/ec2-user/onlinecompiler/temp/';

//Example of what run command should produce
//sudo docker run -n=false -w=/usr/judge -t -v=/vagrant/judge/test/:/usr/judge/:rw test/java7 timout 1s java Test

/*
 * Returns string to build file for lang
 * Arguments:
 * dockerID - id of the docker container that runs this lang 
 * compileCmd - command to compile  
 * codeExtension - extension of lang 
 */
var JavabuildCompileCmd = function (dirname) {
    return "sudo docker run -n=false -w=/usr/compiler -t -v=/home/ec2-user/onlinecompiler/temp/" + dirname +"/"":/usr/compiler/:rw " + 94eacf36e27a + " " + 'javac Main.java';
};

/*
 * Arguments:
 * dockerID - id of the docker container that runs this lang 
 * compileCmd - command to compile  
 * codeExtension - extension of lang 
 */
var JavabuildRunCmd = function (dirname) {
    return "sudo docker run -n=false -w=/usr/compiler -t -v=/home/ec2-user/onlinecompiler/temp/" + dirname +"/"":/usr/compiler/:rw " + 94eacf36e27a + " timeout " + 5 + "s " + 'java ' + 'Main';
};

exports.compileJava = function (envData , code , fn ){
    //creating source file
        var dirname = cuid.slug();
        var path = TEST_FOLDER + dirname;
        fs.mkdir(path , 0o777 , function(err){   
        if(err && exports.stats)
            console.log(err.toString().red);
        else{
            fs.writeFile( path  + "/Main.java" , code  , function(err){            
            if(err && exports.stats)
                console.log('ERROR: '.red + err);
            else
            {
                if(exports.stats)
                    console.log('INFO: '.green + path + "/Main.java created");                       
                shell.exec(JavabuildCompileCmd(dirname), function(error , stdout, stderr){
                    if(error){
                        if(exports.stats)                           
                            console.log("INFO: ".green + path + "compile is error");
                        var out = {error : stderr};
                        console.log('1')
                        fn(out);
                    }
                    else{
                       console.log("INFO: ".green + "compile is ok ");
                       shell.exce(JavabuildRunCmd(dirname), function( error , stdout , stderr ){  
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
                                    console.log('INFO: '.green + path  + '/Main.java contained an error while executing');
                                }                                       
                                var out = { error : stderr};
                                console.log('2')
                                fn(out);
                            }   
                        }
                        else
                        {                       
                            if(exports.stats)
                            {
                                console.log('INFO: '.green + path + '/Main.java successfully compiled and executed !');
                            }
                            var out = { output : stdout};
                            fn(out)                                   
                        }
                    });
                   }
               })

            }          
        });                 
    }
});
}



exports.compileJavaWithInput = function (envData , code , input , fn ){
    //creating source file
    var dirname = cuid.slug();
    path = './temp/'+dirname;

    fs.mkdir(path , 0777 , function(err){   
        if(err && exports.stats)
        console.log(err.toString().red);
        else
        {
            fs.writeFile( path  + "/Main.java" , code  , function(err ){            
                if(err && exports.stats)
                    console.log('ERROR: '.red + err);
                else
                {
                    if(exports.stats)
                        console.log('INFO: '.green + path + "/Main.java created");                      
                    fs.writeFile( path + "/input.txt" , input , function (err){
                        if(err && exports.stats)
                            console.log('ERROR: '.red + err);
                        else
                        {
                            if(envData.OS === "linux")
                            var command = "cd "+path+ " && " + " javac Main.java";
                            exec(command , function( error , stdout , stderr ){                     
                                if(error)
                                {
                                    if(exports.stats)                           
                                        console.log("INFO: ".green + path + "/Main.java contained an error while compiling");
                                    var out = {error :  stderr };
                                    fn(out);
                                }
                                else
                                {
                                    console.log("INFO: ".green + "compiled a java file");
                                    var command = "cd "+path+" && java Main < input.txt";
                                    exec(command , function( error , stdout , stderr ){
                                        if(error)
                                        {
                                            
                                            if(exports.stats)
                                            {
                                                console.log('INFO: '.green + path  + '/Main.java contained an error while executing');
                                            }           
                                            if(error.toString().indexOf('Error: stdout maxBuffer exceeded.') != -1)
                                            {
                                                var out = { error : 'Error: stdout maxBuffer exceeded. You might have initialized an infinite loop.'};
                                                fn(out);
                                            }
                                            else
                                            {
                                                var out = { error : stderr};
                                                fn(out);
                                            }   
                                        }
                                        else
                                        {                       
                                            if(exports.stats)
                                            {
                                                console.log('INFO: '.green + path + '/Main.java successfully compiled and executed !');
                                            }
                                            var out = { output : stdout};
                                            fn(out);                                        
                                        }
                                    });     
                                }
                            });
                        }
                    });
                }          
            });                 
        }
    });
}