import { spawnSync } from "node:child_process";
import { selectedTargets } from "./oss-config.mjs";

function parseArgs(argv) {
  const args = {
    target: "all",
    profile: "",
    configFile: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--target") {
      args.target = argv[++index] || "";
    } else if (arg === "--profile") {
      args.profile = argv[++index] || "";
    } else if (arg === "--config-file") {
      args.configFile = argv[++index] || "";
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function runOssutil(args) {
  const result = spawnSync("ossutil", args, {
    stdio: "inherit",
    shell: false,
  });

  if (result.status !== 0) {
    throw new Error(`ossutil ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

function globalArgs(options, target) {
  const args = ["--endpoint", target.endpoint, "--region", target.region];
  if (options.profile) {
    args.push("--profile", options.profile);
  }
  if (options.configFile) {
    args.push("--config-file", options.configFile);
  }
  return args;
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const targets = selectedTargets(options.target);

  for (const target of targets) {
    const objectUrl = `oss://${target.bucket}/${target.verifyObject}`;
    console.log(`Verifying ${target.name}: ${objectUrl}`);
    runOssutil(["stat", objectUrl, ...globalArgs(options, target)]);
  }
}

try {
  main();
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
