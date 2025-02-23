use tauri::{Manager, WebviewWindowBuilder, WindowEvent};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            #[cfg(desktop)]
            {
                use tauri::Manager;
                use tauri_plugin_global_shortcut::{Code, Modifiers, ShortcutState};
                
                app.handle().plugin(
                    tauri_plugin_global_shortcut::Builder::new()
                        .with_shortcuts(["CommandOrControl+G"])?
                        .with_handler(move |app, shortcut, event| {
                            if event.state == ShortcutState::Pressed {
                                println!("Shortcut pressed");
                                if shortcut.matches(Modifiers::SUPER, Code::KeyG) {
                                    println!("Shortcut matches");
                                    // Try to get existing window
                                    if let Some(window) = app.get_webview_window("command-palette") {
                                        println!("Window exists - closing!");
                                        let _ = window.close();
                                    } else {
                                        println!("Window doesn't exist - creating!");
                                        // Create new window if it doesn't exist
                                        let _ = WebviewWindowBuilder::new(
                                            app,
                                            "command-palette",
                                            tauri::WebviewUrl::App("/command-palette".into()),
                                        )
                                        .title("Command Palette")
                                        .inner_size(600.0, 400.0)
                                        .decorations(false)
                                        .center()
                                        .skip_taskbar(true)
                                        .always_on_top(true)
                                        .build();
                                    }
                                }
                            }
                        })
                        .build(),
                )?;
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
