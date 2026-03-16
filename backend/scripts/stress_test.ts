import WebSocket from 'ws';
import { performance } from 'perf_hooks';

const WS_URL = 'ws://localhost:8080/ws?userId=stress_tester&sessionId=stress_session_1';
const TOTAL_VITALS = 100;
const TOTAL_MESSAGES = 50;

async function runStressTest() {
    console.log(`Starting Stress Test: ${TOTAL_VITALS} vitals, ${TOTAL_MESSAGES} messages...`);

    const ws = new WebSocket(WS_URL);

    let vitalsSent = 0;
    let messagesSent = 0;
    let chatRepliesReceived = 0;
    let totalLatency = 0;

    const messageTimestamps = new Map<number, number>();

    await new Promise((resolve) => {
        ws.on('open', resolve);
    });

    console.log('Connected to WebSocket server.');

    ws.on('message', (data) => {
        const parsed = JSON.parse(data.toString());

        if (parsed.type === 'chat_reply') {
            const receiveTime = performance.now();
            // Assume sequential replies for simplicity in this basic stress test
            const sendTime = messageTimestamps.get(chatRepliesReceived);
            if (sendTime) {
                const latency = receiveTime - sendTime;
                totalLatency += latency;
                console.log(`[Message ${chatRepliesReceived + 1}/${TOTAL_MESSAGES}] Latency: ${latency.toFixed(2)}ms`);
            }
            chatRepliesReceived++;

            if (chatRepliesReceived === TOTAL_MESSAGES) {
                const avgLatency = totalLatency / TOTAL_MESSAGES;
                console.log('\n--- STRESS TEST COMPLETE ---');
                console.log(`Average AI Response Latency: ${avgLatency.toFixed(2)}ms`);
                ws.close();
                process.exit(0);
            }
        }
    });

    ws.on('error', (err) => {
        console.error('WebSocket Error:', err);
        process.exit(1);
    });

    // 1. Rapidly fire 100 vitals
    for (let i = 0; i < TOTAL_VITALS; i++) {
        ws.send(JSON.stringify({
            type: 'vital_stream',
            payload: {
                heart_rate: 60 + Math.floor(Math.random() * 40),
                systolic: 120,
                diastolic: 80,
                temperature: 36.5,
                spo2: 98,
                respiratory_rate: 16
            }
        }));
        vitalsSent++;
    }
    console.log(`Successfully buffered ${vitalsSent} vital streams.`);

    // 2. Fire 50 chat messages sequentially
    const sendNextMessage = () => {
        if (messagesSent >= TOTAL_MESSAGES) return;

        // Stagger slightly so we don't trip rate limits completely instantly
        setTimeout(() => {
            messageTimestamps.set(messagesSent, performance.now());
            ws.send(JSON.stringify({
                type: 'chat_message',
                payload: { text: "I'm feeling a bit dizzy." }
            }));
            messagesSent++;
            sendNextMessage();
        }, 200); // 200ms gap
    };

    sendNextMessage();
}

runStressTest().catch(console.error);
