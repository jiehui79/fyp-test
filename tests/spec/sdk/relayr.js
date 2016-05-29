var relayrInit = function() {
    return RELAYR.init({
        appId: "testerAppid",
        redirectUri: "testerRedirectUri"
    });
};

var token = "testerToken";

describe('relayr SDK', function() {
    var xhr, requests;
    beforeEach(function() {
        xhr = sinon.useFakeXMLHttpRequest();
        requests = [];
        xhr.onCreate = function(xhr) {
            requests.push(xhr);
        }
    });

    describe('#init', function() {
        var validInputs = [{
            appId: "37648273648628",
            redirectUri: "34324234"
        }];

        it('should initialize with constructor with valid arguments', function() {
            var relayr = RELAYR.init({
                appId: '37648273648628',
                redirectUri: '34324234'
            });
            expect(typeof relayr.login).toBe('function');

        });
    });

    describe('#login', function() {
        afterEach(function() {
            localStorage.removeItem("relayrToken")
        });

        it('should throw an error with constructor undefined', function() {
            var f = function() {
                var relayr = RELAYR.init(undefined);
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));

        });

        it('should throw an error with constructor {}', function() {
            var f = function() {
                var relayr = RELAYR.init({});
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));
        });

        it('should throw an error with constructor null', function() {
            var f = function() {
                var relayr = RELAYR.init(null);
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));
        });

        it('should throw an error with constructor ""', function() {
            var f = function() {
                var relayr = RELAYR.init("");
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));
        });

        it('should throw an error with constructor []', function() {
            var f = function() {
                var relayr = RELAYR.init([]);
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));
        });

        it('should throw an error with constructor {appId:true}', function() {
            var f = function() {
                var relayr = RELAYR.init({
                    appId: true
                });
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));
        });

        it('should throw an error with constructor {appId:""}', function() {
            var f = function() {
                var relayr = RELAYR.init({
                    appId: ""
                });
                relayr.login();
            };

            expect(f).toThrow(new Error("Provide credentials: appId and redirectUri"));
        });

        it('should throw an error if callback success not valid or defined with args undefined', function() {
            var f = function() {
                var relayr = relayrInit();
                relayr.login(undefined);
            };
            expect(f).toThrow();
        });

        it('should throw an error if callback success not valid or defined with args {}', function() {
            var f = function() {
                var relayr = relayrInit();
                relayr.login({});
            };
            expect(f).toThrow();
        });

        it('should throw an error if callback success not valid or defined with args null', function() {
            var f = function() {
                var relayr = relayrInit();
                relayr.login(null);
            };
            expect(f).toThrow();
        });

        it('should throw an error if callback success not valid or defined with args ""', function() {
            var f = function() {
                var relayr = relayrInit();
                relayr.login("");
            };
            expect(f).toThrow();
        });

        it('should throw an error if callback success not valid or defined with args []', function() {
            var f = function() {
                var relayr = relayrInit();
                relayr.login([]);
            };
            expect(f).toThrow();
        });

        it('should call success method when the token exists in localStorage', function(done) {
            var relayr = relayrInit();

            localStorage.setItem("relayrToken", token);

            relayr.login({
                success: function() {
                    done();
                },
                error: function() {}
            });
            expect(requests.length).toBe(1);
            var req = requests[0];

            expect(req.url).toBe("https://api.relayr.io/oauth2/user-info");
            req.respond(200, {}, JSON.stringify({
                id: "42387492730487324",
                email: "something@something.com",
                name: "billybob"
            }));

        });


        it('should redirect to the correct oauth login page', function() {
            var relayr = relayrInit();
            relayr.login.redirect = function(uri) {

                this.uri = uri;
            };
            relayr.login({
                success: function() {

                }
            });
            expect(relayr.login.uri).toBe("https://api.relayr.io/oauth2/auth?client_id=testerAppid&redirect_uri=testerRedirectUri&response_type=token&scope=access-own-user-info+configure-devices")
        });
    });

    describe('User', function() {
        var relayr;
        beforeEach(function() {
            relayr = relayrInit();
        });

        afterEach(function() {
            localStorage.removeItem('relayrToken')
        });

        describe('#getUserInfo', function() {
            it('should check if user info returns properties', function(done) {
                localStorage.setItem("relayrToken", token);
                relayr.login({
                    success: function() {
                        done();
                    },
                    error: function() {}
                });
                expect(requests.length).toBe(1);

                var req = requests[0];

                expect(req.url).toBe("https://api.relayr.io/oauth2/user-info");
                req.respond(200, {}, JSON.stringify({
                    id: "42387492730487324",
                    email: "something@something.com",
                    name: "billybob"
                }));
                relayr.user().getUserInfo();

                expect(relayr.account.id).toBeDefined();
                expect(relayr.account.id).toBe("42387492730487324");
            });
        });

        describe('#getToken', function() {
            it('should scrape the token from location hash', function() {
                spyOn(localStorage, 'setItem');
                spyOn(relayr.util, 'getHash').and.returnValue('#access_token=TEST_TOKEN&token_type=TEST_TYPE');

                relayr.user().getToken();

                expect(localStorage.setItem).toHaveBeenCalledWith('relayrToken', 'TEST_TOKEN');
            });
        });

        describe('#setToken', function() {
            it('should store token in localStorage', function() {
                spyOn(localStorage, 'setItem');
                relayr.user().setToken('my-new-token');

                expect(localStorage.setItem).toHaveBeenCalledWith('relayrToken', 'my-new-token');
            });
        });

        describe('#hasToken', function() {
            beforeEach(function() {
                spyOn(localStorage, 'getItem');
            });

            it('returns true if relayrToken is set in localStorage', function() {
                localStorage.getItem.and.returnValue('token');

                expect(relayr.user().hasToken()).toEqual(true);
            });

            it('returns false if relayrToken is not set in localStorage', function() {
                localStorage.getItem.and.returnValue(null);

                expect(relayr.user().hasToken()).toEqual(false);
            });
        });

        describe('#login', function() {
            it('should give unauthorized 401 if token is invalid', function(done) {
                var relayr = relayrInit();

                localStorage.setItem("relayrToken", token);

                relayr.login({
                    success: function() {},
                    error: function() {
                        done();
                    }
                });

                expect(requests.length).toBe(1);

                var req = requests[0];
                expect(req.url).toBe("https://api.relayr.io/oauth2/user-info");

                req.respond(401, {}, JSON.stringify({
                    id: "42387492730487324",
                    email: "something@something.com",
                    name: "billybob"
                }));
            });
        });

        describe('#logout', function() {
            it('logout should remove key from storage', function() {
                localStorage.setItem("relayrToken", token);

                var relayr = relayrInit();
                var storageToken = localStorage.getItem("relayrToken")

                relayr.user().logout();
                var check = localStorage.getItem("relayrToken");
                expect(check).toBe(null);
            });
        });
    });

    describe('devices', function() {
        var relayr;
        beforeEach(function() {
            relayr = relayrInit();
            relayr.account = {
                id: 'test-dummy-account-id',
                token: 'test-dummy-token'
            };
        });

        describe('#getDeviceData', function() {
            it('should do a POST to channels api', function() {
                relayr.devices().getDeviceData({
                    deviceId: '-device-id-'
                });

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/channels');
                expect(req.method).toBe('POST');
            });
        });

        describe('#getDevice', function() {
            it('should throw an error if no id is provided', function() {
                var f = function() {
                    relayr.devices().getDevice();
                };

                expect(f).toThrow();
            });

            it('should do a GET to users devices', function() {
                relayr.devices().getDevice({
                    deviceId: 'device-id'
                }, function() {}, function() {});

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/devices/device-id');
            });

            it('should resolve promise when it gets device', function(done) {
                relayr.devices().getDevice({
                    deviceId: 'device-id'
                }).then(function() {
                    expect(true).toBeTruthy();
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });


            it('should reject promise if the request fails', function(done) {
                relayr.devices().getDevice({
                    deviceId: 'device-id'
                }).then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });

        describe('#getDeviceState', function() {
            it('should throw an error if no id is provided', function() {
                var f = function() {
                    relayr.devices().getDeviceState();
                };

                expect(f).toThrow();
            });

            it('should do a GET to users devices', function() {
                relayr.devices().getDeviceState({
                    deviceId: 'device-id'
                });

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/devices/device-id/state');
            });

            it('should resolve promise when it gets data', function(done) {
                relayr.devices().getDeviceState({
                    deviceId: 'device-id'
                }).then(function() {
                    expect(true).toBeTruthy();
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });


            it('should reject promise if the request fails', function(done) {
                relayr.devices().getDevice({
                    deviceId: 'device-id'
                }).then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });

        describe('#getAllDevices', function() {

            it('should do a GET to users devices', function() {
                relayr.devices().getAllDevices();

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/users/test-dummy-account-id/devices');
            });

            it('should resolve promise when it gets data', function(done) {
                relayr.devices().getAllDevices().then(function() {
                    expect(true).toBeTruthy();
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });


            it('should reject promise if the request fails', function(done) {
                relayr.devices().getAllDevices().then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });

        describe('#sendCommand', function() {
            it('should throw an error if no id is provided', function() {
                var f = function() {
                    relayr.devices().sendCommand();
                };

                expect(f).toThrow();
            });

            it('should do a POST to api', function() {
                relayr.devices().sendCommand({
                    deviceId: 'device-id',
                    command: 'test-command'
                });
                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/devices/device-id/commands');
                expect(req.method).toBe('POST');
            });

            it('should resolve promise when it sends the command', function(done) {
                relayr.devices().sendCommand({
                    deviceId: 'device-id',
                    command: 'test-command'
                }).then(function() {
                    expect(true).toBeTruthy();
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });


            it('should reject promise if the command fails', function(done) {
                relayr.devices().sendCommand({
                    deviceId: 'device-id',
                    command: 'test-command'
                }).then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });

    });

    describe('groups', function() {
        var relayr;
        beforeEach(function() {
            relayr = relayrInit();
            relayr.account = {
                id: 'test-dummy-account-id',
                token: 'test-dummy-token'
            };
        });

        describe('#getAllGroups', function() {

            it('should do a GET to users devices', function() {
                relayr.groups().getAllGroups();

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/users/test-dummy-account-id/groups');
            });

            it('should resolve promise gets data with response', function(done) {
                relayr.groups().getAllGroups().then(function(data) {
                    expect(data).toEqual([]);
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });

            it('should reject promise if the request fails', function(done) {
                relayr.groups().getAllGroups().then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });

    });

    describe('models', function() {
        var relayr;
        beforeEach(function() {
            relayr = relayrInit();
            relayr.account = {
                id: 'test-dummy-account-id',
                token: 'test-dummy-token'
            };
        });

        describe('#getAllModels', function() {

            it('should do a GET to users devices', function() {
                relayr.models().getAllModels(function() {}, function() {});

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/device-models?limit=100000');
            });

            it('should resolve promise it gets data with response', function(done) {
                relayr.models().getAllModels().then(function(data) {
                    expect(data).toEqual([]);
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });

            it('should reject promise if the request fails', function(done) {
                relayr.models().getAllModels().then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });
    });

    describe('Transmitters', function() {

        var relayr;
        beforeEach(function() {
            relayr = relayrInit();
            relayr.account = {
                id: 'test-dummy-account-id',
                token: 'test-dummy-token'
            };
        });

        describe('#getTransmitters', function() {
            it('should do a GET to users transmitters', function() {
                relayr.transmitters().getTransmitters();

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/users/test-dummy-account-id/transmitters');
            });
        });


        describe('#deleteTransmitter', function() {
            it('should throw an error if no id is provided', function() {
                var f = function() {
                    relayr.transmitters().deleteTransmitter();
                };

                expect(f).toThrow();
            });

            it('should do a DELETE to users transmitter', function() {
                relayr.transmitters().deleteTransmitter({
                    transmitterId: 'deleteId'
                });

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/transmitters/deleteId');
            });

            it('should resolve promise when it deletes the transmitter', function(done) {
                relayr.transmitters().deleteTransmitter({
                    transmitterId: 'deleteId'
                }).then(function() {
                    expect(true).toBeTruthy();
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });


            it('should reject promise if the request fails', function(done) {
                relayr.transmitters().deleteTransmitter({
                    transmitterId: 'deleteId'
                }).then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });
        describe('#updateTransmitter', function() {
            it('should throw an error if no id is provided', function() {
                var f = function() {
                    relayr.transmitters().deleteTransmitter();
                };

                expect(f).toThrow();
            });

            it('should do a PATCH to channels api', function() {
                relayr.transmitters().updateTransmitter({
                    transmitterId: 'transmitterId'
                });

                expect(requests.length).toBe(1);
                var req = requests[0];
                expect(req.url).toBe('https://api.relayr.io/transmitters/transmitterId');
                expect(req.method).toBe('PATCH');
            });

            it('should resolve promise when it updates the transmitter', function(done) {
                relayr.transmitters().updateTransmitter({
                    transmitterId: 'transmitterId'
                }).then(function() {
                    expect(true).toBeTruthy();
                    done();
                }, function() {});

                var req = requests[0];
                req.respond(200, {}, JSON.stringify([]));
            });


            it('should reject promise if the request fails', function(done) {
                relayr.transmitters().updateTransmitter({
                    transmitterId: 'transmitterId'
                }).then(function() {}, function() {
                    expect(true).toBeTruthy();
                    done();
                });

                var req = requests[0];
                req.respond(401, {
                    "Content-Type": "application/json"
                }, JSON.stringify({
                    error: "error"
                }));
            });
        });
    });

    describe('util', function() {
        var relayr;
        beforeEach(function() {
            relayr = relayrInit();
        });

        describe('#ajax', function() {
            describe('sucess', function() {
                it('call succes cb on response 200', function(done) {
                    relayr.util.ajax({}, function(data) {
                        expect(data).toEqual('{}');
                        done();
                    }, function() {});

                    var req = requests[0];
                    req.respond(200, {}, JSON.stringify({}));
                });

                it('call succes cb on response 201', function(done) {
                    relayr.util.ajax({}, function(data) {
                        expect(data).toEqual('{}');
                        done();
                    }, function() {});

                    var req = requests[0];
                    req.respond(201, {}, JSON.stringify({}));
                });
            });

            describe('error', function() {
                it('call error cb on response 400', function(done) {
                    relayr.util.ajax({}, function() {}, function(data) {
                        expect(data).toEqual(jasmine.any(Object));
                        done();
                    });

                    var req = requests[0];
                    req.respond(400, {}, JSON.stringify({}));
                });

                it('call error cb on response 401', function(done) {
                    relayr.util.ajax({}, function() {}, function(data) {
                        expect(data).toEqual(jasmine.any(Object));
                        done();
                    });

                    var req = requests[0];
                    req.respond(401, {}, JSON.stringify({}));
                });

                it('call error cb on response 404', function(done) {
                    relayr.util.ajax({}, function() {}, function(data) {
                        expect(data).toEqual(jasmine.any(Object));
                        done();
                    });

                    var req = requests[0];
                    req.respond(404, {}, JSON.stringify({}));
                });

                it('call error cb on response 500', function(done) {
                    relayr.util.ajax({}, function() {}, function(data) {
                        expect(data).toEqual(jasmine.any(Object));
                        done();
                    });

                    var req = requests[0];
                    req.respond(500, {}, JSON.stringify({}));
                });
            });
        });
    });
});
