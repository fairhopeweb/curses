use tauri::{Runtime, plugin::{TauriPlugin, Builder}, command};


#[command]
async fn translate() {
    // abuse google

    
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("translate")
        .invoke_handler(tauri::generate_handler![translate])
        .build()
}