$(function () {
    var socket = io(), picColor = null;

    // 팔레트
    // https://bgrins.github.io/spectrum/
    $("#picker").spectrum({
        showButtons: false,
        showPalette: true,
        palette: [
            ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
            ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
            ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
            ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
            ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
            ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
            ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
            ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
        ],
        change: function(color) {
            picColor = color.toHexString(); // #ff0000
        }
    });

    // 사용자가 알림 권한 설정
    // if (window.Notification) { Notification.requestPermission(); }

    socket.on('connect', function () {
        socket.emit('current user', function () {});
    });
    socket.on('current user count', function (data) {
        $("#users").empty();
        $("#users").append('<p>현재 접속자 : ' + Object.keys(data).length + '명</p>');
        if (Object.keys(data).length > 0) {
            $.each(data,  function (key, value) {
                $("#users").append('<div>' + key + '</div>');
            })
        }
    });

    $("#conn-btn").click(function () {
        if ($("#name").val() == "") {
            swal({
                    title: "닉네임 쓰자",
                    type: "warning",
                    closeOnConfirm: false
                },
                function(){
                    swal.close();
                    $("#name").focus();
                });
            return;
        }

        socket.emit('add user', $('#name').val());
        socket.on('connect users', function (data) {
            $("#users").empty();
            $("#users").append('<p>현재 접속자 : ' + Object.keys(data).length + '명</p>');
            $.each(data,  function (key, value) {
                $("#users").append('<div>' + key + '</div>');
            })
        });
        $("#name").prop('readonly', true);
        $("#conn-btn-div").hide();
        $("#name-mod-btn-div").show();
    });

    $("#name-mod-btn").click(function () {
        swal({
            title: "입력하쎄용",
            text: "바꿀 이름 입력하쎄여",
            type: "input",
            showCancelButton: true,
            closeOnConfirm: false,
            animation: "slide-from-top",
            inputPlaceholder: "이름"
        },
        function(inputValue){
            if (inputValue === false) return false;

            if (inputValue === "") {
                swal.showInputError("안썼는데!!!!??");
                return false
            }

            socket.emit('mod user', $("#name").val(), inputValue);
            $("#name").val(inputValue);
            swal("이름 바뀜!");

            socket.on('connect users', function (data) {
                $("#users").empty();
                $("#users").append('<p>현재 접속자 : ' + Object.keys(data).length + '명</p>');
                $.each(data,  function (key, value) {
                    $("#users").append('<div>' + key + '</div>');
                })
            });
        });
    });

    $('input#msg').keypress(function (e) {
        if (e.which == 13) {
            e.preventDefault();

            if (!$("#name").prop('readonly')) {
                swal({
                        title: "접속을 하지 않았읍니다..",
                        type: "warning",
                        closeOnConfirm: false
                    },
                    function () {
                        swal.close();
                        $("#name").focus();
                    });
                return;
            }

            var curTime = new Date();
            curTime = addZero(curTime.getHours()) + ":" + addZero(curTime.getMinutes());

            if ($("#msg").val() === '/close') {
                window.open('about:blank','_self').close();
            } else if ($("#msg").val().indexOf('/alert') > -1) {
                var realMsg = $("#msg").val().substring(7);
                $("#msg").val('<script>alert("' + realMsg + '")</script>');
            } else if ($("#msg").val().indexOf('/swal') > -1) {
                var realMsg = $("#msg").val().substring(6);
                $("#msg").val('<script>swal("' + realMsg + '")</script>');
            }

            socket.emit("chat message", {
                name: $("#name").val(),
                msg: $("#msg").val(),
                sendTime: curTime,
                picColor: picColor
            });

            $("#msg").val("").focus();
            return false;
        }

    });
    socket.on("chat message", function (data) {
        if (data.picColor) {
            var html = "<p style='margin-bottom: 0px;'>" + data.name + " : <span style='color: " + data.picColor + ";'>" + data.msg + "</span><p>" + data.sendTime + "</p></p>";
        } else {
            var html = "<p style='margin-bottom: 0px;'>" + data.name + " : " + data.msg + "<p>" + data.sendTime + "</p></p>";
        }
        $("#chat").prepend(html);
        // setTimeout(function () { notify(); }, 1000);
    });
});

function notify() {
    if (Notification.permission !== 'granted') {
        alert('notification is disabled');
    } else {
        var notification = new Notification('Notification title', {
            icon : '',
            body: 'Notification text'
        });

        notification.onclick = function () {
          swal('눌렀눼');
        };
    }
}

function addZero(c) {
    var cString = c.toString();
    if (cString.length == 1) {
        cString = "0" + cString;
    }
    return cString;
}