import argparse
import json
import math
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
CONFIG_PATH = Path(__file__).with_name("terrain.config.json")


def mercator_area(bounds: list[float]) -> float:
    west, south, east, north = bounds
    south = max(south, -85.05112878)
    north = min(north, 85.05112878)

    def mercator_y(latitude: float) -> float:
        radians = math.radians(latitude)
        return math.log(math.tan(math.pi / 4 + radians / 2))

    return math.radians(east - west) * (mercator_y(north) - mercator_y(south))


def estimate(sample_profiles: list[str], target_profile: str) -> dict[str, object]:
    config = json.loads(CONFIG_PATH.read_text(encoding="utf-8"))
    target_bounds = config["profiles"][target_profile]["bounds"]
    target_area = mercator_area(target_bounds)
    samples = []
    estimates = []
    for profile in sample_profiles:
        manifest_path = ROOT / ".terrain-work" / profile / "build-manifest.json"
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        density = manifest["bytes"] / mercator_area(config["profiles"][profile]["bounds"])
        projected_bytes = round(density * target_area)
        estimates.append(projected_bytes)
        samples.append({"profile": profile, "bytes": manifest["bytes"], "projectedBytes": projected_bytes})
    central_bytes = round(sum(estimates) / len(estimates))
    return {
        "targetProfile": target_profile,
        "samples": samples,
        "estimatedBytes": central_bytes,
        "sampleRangeBytes": [min(estimates), max(estimates)],
        "caveat": "Sample density scaling does not model empty tiles or full-build encoder overhead.",
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Estimate a terrain archive from a built sample")
    parser.add_argument("target_profile")
    parser.add_argument("sample_profiles", nargs="+")
    args = parser.parse_args()
    print(json.dumps(estimate(args.sample_profiles, args.target_profile), indent=2))


if __name__ == "__main__":
    main()
