//connect to cloud
var relayr = RELAYR.init({
    // this comes from the api key page on the dashboard
    //PROJECT ID from Relayr!!
    appId: "b5bf01d1-74b5-425c-a93c-6671ed675180", // this identifies my website as a 'trusted user' basically- it expects me to show up and ask for access to stuff
    redirectUri: "http://jiehui79.github.io/fyp-test/browserSDKFullExample/html-dashboard.html"
});

// these could hold the output from various sensors, based on device id for instance,
// so I can do multiple device calls at once and not get confused
var dev1
var dev2

// create more variables to store rounded figures
var dev1r
var dev2r

// in order to do anything other than get straight readings, you have to log in
relayr.login({
    // the login function returns success or error, 
    // the token is generated when you log in to your account in that redirect, 
    // and is passed in the local memory of the browser
    success: function (token) {

            //getUserInfo creates a Promise, so call .then on it
            relayr.user().getUserInfo().then(
                //a fulfilled promise returns an object which has user properties, including email
                function fulfilled(msg) {
                    //inject this text into the html
                    $(".users").text(msg.email);
                }, //if the promise resolves as rejected it will log this error
                function rejected(err) {
                    console.log("error, the promise was rejected")
                }
            );

            //get all the devices asstd with an account, the loop is just to dispay them
            relayr.devices().getAllDevices().then(
                //a fulfilled promise returns an object msg
                function fulfilled(msg) {
                    // loops through the object holding the devices, x gives you an index
                    for (x in msg) {
                        // tack the object[index].name on to the list displayed in the html
                        //!!
                        $('').text(msg[x].name).appendTo('.devices');
                    }
                }, //if the promise resolves as rejected it will log this error
                function rejected(err) {
                    console.log("error, the promise was rejected")
                }
            );

            // this gets the data from the devices
            relayr.devices().getDeviceData({
                // this is the same token as above
                token: token, // identifies one device from another
                deviceId: "672c5ce6-d170-4278-a68f-8f5e2b32c124", //function that grabs the reading from the data from the device
                incomingData: function (data) {

                    if (data.readings[0].meaning == "Average Power") {
                        dev1 = data.readings[0].value;
                        dev1r = Math.round(dev1 * 100) / 100;
                    }
                    if (data.readings[0].meaning == "Elapsed Seconds") {
                        dev2 = data.readings[0].value;
                        dev2r = Math.round(dev2 * 100) / 100;
                    }
                    //inserts into html
                    $(".reading1").text(dev1r + " Wh");
                    $(".reading2").text(dev2r + " s");
                }
            });

            // displays all of the user's groups
            //get all the devices asstd with an account, the loop is just to dispay them
            relayr.groups().getAllGroups().then(
                //a fulfilled promise returns an object msg
                function fulfilled(msg) {
                    // loops through the object holding the devices, x gives you an index
                    for (x in msg) {
                        // tack the object[index].name on to the list displayed in the html
                        $('<ul>').text(msg[x].name).appendTo('.groups');
                    }
                }, //if the promise resolves as rejected it will log this error
                function rejected(err) {
                    console.log("error, the promise was rejected")
                }
            );

            // displays models available to the user (including public ones)
            relayr.models().getAllModels().then(
                //a fulfilled promise returns an object msg
                function fulfilled(msg) {
                    // loops through the object holding the models, x gives you an index
                    for (x in msg) {
                        // tack the object[index].name on to the list displayed in the html
                        $('<ul>').text(msg[x].name).appendTo('.models');
                    }
                }, //if the promise resolves as rejected it will log this error
                function rejected(err) {
                    console.log("error, the promise was rejected")
                }
            );

            // displays transmitters
            relayr.transmitters().getTransmitters().then(
                //a fulfilled promise returns an object msg
                function fulfilled(msg) {
                    // loops through the object holding the transmitters, x gives you an index
                    for (x in msg) {
                        // tack the object[index].name on to the list displayed in the html
                        $('<ul>').text(msg[x].name + " : " + msg[x].id).appendTo('.transmitterlist');
                    }

                    //define what happens when you click the delete button
                    $("#delete").click(function () {
                        var transmitter = {
                            transmitterId: String(msg[0].id)
                        };
                        //give the command to actually delete it
                        relayr.transmitters().deleteTransmitter(transmitterId).then(
                            function fulfilled(msg) {
                                location.reload();
                            }
                            , function rejected(err) {
                                console.log("error, the promise was rejected")
                            }
                        );
                    });

                    //define what happens when you click the "update name" button
                    $("#updateName").click(function () {
                        //get the ID of the transmitter at the top of the list

                        var transmitter = {
                            transmitterId: String(msg[0].id)
                            , name: $('.status-box').val()
                        };
                        //give the command to update the name of the transmitter with the top ID with the text from the input box
                        relayr.transmitters().updateTransmitter(transmitter).then(
                            function fulfilled(msg) {
                                location.reload();
                            }
                            , function rejected(err) {
                                console.log("error, the promise was rejected")
                            });
                    });

                },

                //if the promise resolves as rejected it will log this error
                function rejected(err) {
                    console.log("error, the promise was rejected")
                }
            );

        } //end of success
}); //end of login