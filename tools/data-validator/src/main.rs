mod manifest;
mod model;
mod runtime_index;
mod validate;

use std::{env, path::PathBuf, process::ExitCode};

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
    let mut arguments = env::args_os().skip(1);
    let first = arguments
        .next()
        .map(PathBuf::from)
        .ok_or_else(|| usage().to_owned())?;

    if first.as_os_str() == "prepare" {
        let manifest_path = arguments
            .next()
            .map(PathBuf::from)
            .ok_or_else(|| usage().to_owned())?;
        let output_path = arguments
            .next()
            .map(PathBuf::from)
            .ok_or_else(|| usage().to_owned())?;
        if arguments.next().is_some() {
            return Err(usage().to_owned());
        }
        let output = runtime_index::write(&manifest_path, &output_path)?;
        println!("Prepared runtime data index: {}", output.display());
        return Ok(());
    }

    if arguments.next().is_some() {
        return Err(usage().to_owned());
    }

    let path = first;
    let data: ProjectData = manifest::load_project(&path)?;
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

fn usage() -> &'static str {
    "Usage: data-validator <project-data.json|manifest.json> | data-validator prepare <manifest.json> <runtime-index.json>"
}
