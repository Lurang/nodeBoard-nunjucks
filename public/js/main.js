const ws = new WebSocket('ws://localhost:3000');

heartbeat = () => {
    clearTimeout(this.pingTimeout);
    // 3초뒤에 terminate, 한번도호출되면 전에세팅해둔거 clear함
    // 서버에서 이미 3초에한번꼴로 ping을보내고있고 그핑에응답하지않으면
    // terminate된다는 함수이긴한데..
    this.pingTimeout = setTimeout(() => {
        this.terminate();
    }, 3000 + 1000);
}

ws.onopen = () => {
    heartbeat;
    ws.send(JSON.stringify({
        event: 'login',
    }));
}
ws.onping = () => {
    heartbeat;
}
ws.onclose = () => {
    $(() => {
        location.reload();
    });
    clearTimeout(this.pingTimeout);
}
//web socket receive message
ws.onmessage = (message) => {
    let data = JSON.parse(message.data);
    switch (data.event) {
        case 'login':
            $('#chatLogs').append(`<li style='text-align: center; color: blue;'>${data.id}님이 입장하셨습니다.</li>`);
            $('#chatLogs').scrollTop($('#chatLogs')[0].scrollHeight);
            break;
        case 'chat':
            if ((data.id === '{{session.id}}') || (data.id === 'unknown' && !`{{session}}`)) {
                $('#chatLogs').append(`<li style='text-align: right; color: red;'>${data.id}님의 메세지: ${data.msg}</li>`);
                $('#chatLogs').scrollTop($('#chatLogs')[0].scrollHeight);
            } else {
                $('#chatLogs').append(`<li style='text-align: left;'>${data.id}님의 메세지: ${data.msg}</li>`);
                $('#chatLogs').scrollTop($('#chatLogs')[0].scrollHeight);
            }
            break;
    }
};
//message button click
$(() => {
    $('#sendMessage').click(async () => {
        const $msgForm = $('#msgForm');
        if ($msgForm.val() === '') {
            return;
        } else {
            let sendData = {
                event: 'chat',
                msg: $msgForm.val(),
            };
            await ws.send(JSON.stringify(sendData));
            $msgForm.val('');
        };
    });
});