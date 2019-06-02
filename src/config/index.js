export const STREAM_URL = '';
export const SOURCE_URI = "rtsp://10.1.0.7:554/ISAPI/streaming/channels/101";
export const WEATHER_URL = 'http://api.openweathermap.org/data/2.5/weather';
export const WEATHER_QUERY_PARAMS = {
    APPID: 'f4e4652a709549a302164efb45ded543',
    id: 553915, // Калуга
    units: 'metric',
    lang: 'ru',
};

export const ID_SERVER_URL = 'http://192.168.3.5:8080';
export const EVENT_SERVICE_ENDPOINT_URL = '/BioxidServer/jsonrpc/eventmonitor';
export const MEDIA_CHANNEL_ID = '3EhLgxzWBbsAEVKdntgd4J';
export const EVENT_CODE = 70208;
export const EMPLOYEE_CARD_LIFETIME = 30000;

export const NVR_SERVER = 'nvr1.algont';
export const VA_SERVER = 'va.algont';

export const WEBSOCKET_VA = 'websocket-va.nvr1.algont';
export const WEBSOCKET_RTSP = 'websocket-rtsp';

export const VA_PORT = '8899';
export const RTSP_PORT = '8898';

export const STREAM_ID = 'welcomeStream';

export const VA_SERVICE_ENDPOINT = 'http://' + VA_SERVER + ':' + VA_PORT + '/service';
export const VA_SYSTEM_ENDPOINT = 'http://' + VA_SERVER + ':' + VA_PORT + '/system';

export const RTSP_SERVICE_ENDPOINT = 'http://' + VA_SERVER + ':' + RTSP_PORT + '/service';
export const RTSP_SYSTEM_ENDPOINT = 'http://' + VA_SERVER + ':' + RTSP_PORT + '/system';

export const WEBSOCKET_VA_SERVICE_ENDPOINT = 'http://' + WEBSOCKET_VA + '/services/va_processor/service';

export const EVENT_SERVICE_ENDPOINT = ID_SERVER_URL + '/BioxidServer/jsonrpc/eventmonitor';

export const BANNER_INTERVAL = 10000;
export const BANNER_AMOUNT = 5;