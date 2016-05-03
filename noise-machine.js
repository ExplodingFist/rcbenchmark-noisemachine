///////////////////////////////////////////////////////////////////////////////////////////////////
//  ______     ______     ______     __  __     ______     ______     __     ______     __   __    
// /\  == \   /\  ___\   /\  ___\   /\ \/\ \   /\  == \   /\  ___\   /\ \   /\  __ \   /\ "-.\ \   
// \ \  __<   \ \  __\   \ \ \____  \ \ \_\ \  \ \  __<   \ \___  \  \ \ \  \ \ \/\ \  \ \ \-.  \  
//  \ \_\ \_\  \ \_____\  \ \_____\  \ \_____\  \ \_\ \_\  \/\_____\  \ \_\  \ \_____\  \ \_\\"\_\ 
//   \/_/ /_/   \/_____/   \/_____/   \/_____/   \/_/ /_/   \/_____/   \/_/   \/_____/   \/_/ \/_/
//
////////////////////////////////////// Noise Machine //////////////////////////////////////////////
// Designed for use with the RCBenchMark Dynamometer - https://www.rcbenchmark.com/
// Used to generate as much variable motor noise as possible to test video current filtering.
///////////////////////////////////////////////////////////////////////////////////////////////////
// Created by Exploding Fist (TheRecursion)
// expfist@recursion.tk
// Hello World! - This is my first RCBenchMark script.
///////////////////////////////////////////////////////////////////////////////////////////////////
// Configuration
var minCommand = 1000;  // us  
var minThrottle = 1035; // us       
var maxThrottle = 1900; // us  
var throttleChangeWait = 0.1;   // Seconds between commands (float)
var noiseSteps = 5;             // Variance in noise. Minimum 3. 
var extremeSteps = true;        // Min <-> Max really fast (watch temps)
var extremeIterations = 5;      // Number of times to extreme cycle motors
var iterations = 4;             // Number of loop iterations
var randomIterations = 5;       // Number of random thrust changes mid cycle
// End of Configuration ///////////////////////////////////////////////////////////////////////////

/////////////////////////////
// Command points
/////////////////////////////

var commandResolution = maxThrottle - minThrottle;
var stepResolution = Math.floor(commandResolution / noiseSteps);
var escCommands = getEscCommands();


////////////////
// Startup
////////////////

//ESC initialization
rcb.console.print("Initializing ESC...");
rcb.output.pwm("esc",minCommand);
rcb.console.warning("Clear props of all appendages! 4 seconds until execution....");
var iteration = 0;
rcb.console.setVerbose = false;
rcb.wait(function(){makeNoise(0);}, 4);


/////////////////////
// Execution Loop
/////////////////////

function makeNoise(recursion) {
    rcb.console.print("Debug: Recursion is now " + recursion);
    if (iteration >= iterations) {
        rcb.output.pwm("esc", minCommand);
        rcb.console.print("Execution complete.");
        rcb.endScript();
    } else {
        if (recursion === 0) {
            // Idling to ensure we don't desynch
            rcb.console.print("Idling motors.");
            rcb.output.pwm("esc", minThrottle);
            rcb.wait(function(){makeNoise(1);}, 2);
        }
        if (recursion == 1) {
            // Ramp to max
            rcb.console.print("Ramping to full throttle.");
            rcb.output.ramp("esc", minThrottle, maxThrottle, throttleChangeWait,function(){makeNoise(2);});
        }
        if (recursion == 2) {
            // Ramp down to min
            rcb.console.print("Ramping to min throttle.");
            rcb.output.ramp("esc", maxThrottle, minThrottle, throttleChangeWait, function(){makeNoise(3);});
        }
        if (recursion == 3) {
            // Random ramped changes
            rcb.console.print("Random sudden thrust changes.");
            randomRamped(1, minThrottle, 4);
        }
        if (recursion == 4) {
            // Random sudden changes
            rcb.console.print("Random sudden thrust changes.");
            randomSudden(1, minThrottle, 5);
        }
        if (recursion == 5) {
            if (extremeSteps) {
                rcb.console.print("Extreme thrust changes.");
                extreme(extremeIterations, 1, 1, 6);
            } else{
                makeNoise(6);
            }

        }
        if (recursion == 6) {
            rcb.console.print("Iteration " + iteration + " complete.");
            iteration++;
            makeNoise(1);
        }
    }
}


////////////////////////////////////
// Random Ramped Throttle Changes
////////////////////////////////////

function randomRamped(randomSt, randomOldCommand, recursionNext) {
    if (randomSt >= randomIterations) {
        rcb.console.print("Random ramped thrust changes ended.");
        makeNoise(recursionNext);
    } else {
        randomSt++;
        var randomNewCommand = randomOldCommand;
        while (randomNewCommand == randomOldCommand) {
           // Make sure the new command is not the same as the last one
           randomNewCommand = escCommands[Math.floor(Math.random() * escCommands.length)];
        }
        rcb.output.ramp("esc", randomOldCommand, randomNewCommand, throttleChangeWait, function(){randomRamped(randomSt, randomNewCommand, recursionNext);});
    }
}


////////////////////////////////////
// Random Sudden Throttle Changes
////////////////////////////////////

function randomSudden(randomSud, randomOldCommand, recursionNext) {
     if (randomSud >= randomIterations) {
        rcb.console.print("Random sudden thrust changes ended.");
        makeNoise(recursionNext);
    } else {
        randomSud++;
        var randomNewCommand = randomOldCommand;
        while (randomNewCommand == randomOldCommand) {
           // Make sure the new command is not the same as the last one
           randomNewCommand = escCommands[Math.floor(Math.random() * escCommands.length)];
        }
        rcb.output.pwm("esc", randomNewCommand);
        rcb.wait(function(){randomSudden(randomSud, randomNewCommand, recursionNext);}, throttleChangeWait);
    }
}
                

/////////////////////
// Extreme Noise
/////////////////////

function extreme(exIterations, exIteration, exPhase, recursionNext) {
    
    if (exIteration >= exIterations) {
        rcb.console.print("Extreme Thrust changes ended.");
        makeNoise(recursionNext);
    } else {
        if (exPhase == 1) {
            rcb.output.pwm("esc", maxThrottle);
            rcb.wait(function(){extreme(exIterations, exIteration, 2, recursionNext);},throttleChangeWait);    
        } else {
            rcb.output.pwm("esc", minThrottle);
            exIteration++;
            rcb.wait(function(){extreme(exIterations, exIteration, 1, recursionNext);},throttleChangeWait); 
        }
    }
}


/////////////////////////////////
// Generate ESC throttle points
/////////////////////////////////

function getEscCommands() {
    //var badDebug = [1100,1180,1280];
    //return badDebug;
    var eCommands = [];
    var currentResolution = minThrottle;
    for (i = 0; i < noiseSteps; i++) {
            eCommands[i] = currentResolution;
            currentResolution = currentResolution + stepResolution;
    }
    return eCommands;
}
