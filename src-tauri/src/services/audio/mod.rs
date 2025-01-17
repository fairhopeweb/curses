use std::io::Cursor;

use rodio::{
    cpal::{self, traits::HostTrait},
    Decoder, DeviceTrait, OutputStream, OutputStreamHandle, Sink,
};
use serde::{Serialize, Deserialize};
use tauri::{
    command,
    plugin::{Builder, TauriPlugin},
    Runtime,
};

fn get_output_stream(device_name: &str) -> Option<(OutputStream, OutputStreamHandle)> {
    let host = cpal::default_host();
    let mut devices = host.output_devices().unwrap();
    if let Some(device) = devices.find(|device| device.name().unwrap() == device_name) {
        OutputStream::try_from_device(&device).ok()
    } else {
        None
    }
}

#[derive(Serialize, Deserialize, Debug)]
pub struct RpcAudioPlayAsync {
    device_name: String,
    data: Vec<u8>,
    volume: f32, // 1 - base
    rate: f32, // 1 - base
}

#[command]
async fn play_async(data: RpcAudioPlayAsync) -> Result<(), String> {
    if let Some((_stream, stream_handle)) = get_output_stream(data.device_name.as_str()) {
        // let (_stream, stream_handle) = OutputStream::try_default().unwrap();
        let sink = Sink::try_new(&stream_handle).unwrap();
        sink.set_volume(data.volume);
        sink.set_speed(data.rate);
        let source = Decoder::new(Cursor::new(data.data)).unwrap();
        sink.append(source);
        sink.sleep_until_end();
        Ok(())
    }
    else {
        Err("Invalid device".to_string())
    }
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("audio")
        .invoke_handler(tauri::generate_handler![play_async])
        .build()
}
