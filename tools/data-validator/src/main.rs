mod model;
mod validate;

use std::{env, fs, path::PathBuf, process::ExitCode};

use model::ProjectData;

fn main() -> ExitCode {
    match run() {
        Ok(()) => ExitCode::SUCCESS,
        Err(message) => {
            eprintln!("{message}");
            ExitCode::FAILURE
        }
    }
}

fn run() -> Result<(), String> {
    let path = input_path()?;
    let content = fs::read_to_string(&path)
        .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    let data: ProjectData = serde_json::from_str(&content)
        .map_err(|error| format!("Invalid JSON in {}: {error}", path.display()))?;
    let errors = validate::validate(&data);

    if errors.is_empty() {
        println!("Valid historical data: {}", path.display());
        return Ok(());
    }

    let details = errors
        .iter()
        .map(|error| format!("- {error}"))
        .collect::<Vec<_>>()
        .join("\n");
    Err(format!(
        "Historical data validation failed with {} error(s):\n{details}",
        errors.len()
    ))
}

fn input_path() -> Result<PathBuf, String> {
    let mut arguments = env::args_os().skip(1);
    let path = arguments
        .next()
        .map(PathBuf::from)
        .ok_or_else(|| "Usage: data-validator <project-data.json>".to_owned())?;

    if arguments.next().is_some() {
        return Err("Usage: data-validator <project-data.json>".to_owned());
    }

    Ok(path)
}
