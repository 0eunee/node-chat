$(function () {
    var socket = io();

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
            socket.emit("chat message", {
                name: $("#name").val(),
                msg: $("#msg").val(),
                sendTime: curTime
            });
            $("#msg").val("").focus();
            return false;
        }

    });
    socket.on("chat message", function (data) {
        var html = "<p style='margin-bottom: 0px;'>" + data.name + " : " + data.msg + "<p>" + data.sendTime + "</p></p>";
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