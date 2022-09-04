(async function () {
  const execa = (await import("execa")).execaCommand;
  const chalk = (await import("chalk")).default;
  const semver = (await import("semver")).default;
  const inquirer = (await import("inquirer")).default;
  const fs = (await import("fs")).default;
  const cpx = (await import("cpx")).default;
  const path = (await import("path")).default;
  const Listr = (await import("listr")).default;

  const pkg = require("../package.json");

  const joinRoot = path.join.bind(path, __dirname, "..");

  const BUILD_DIR = joinRoot("build");

  function checkBranch() {
    return execa("git rev-parse --abbrev-ref HEAD").then((result) => {
      if (result.stdout !== "master") {
        throw new Error(chalk.bold.red("Please run release script on master branch."));
      }
    });
  }

  function checkWorkingTree() {
    return execa("git status -s").then((result) => {
      if (result.stdout !== "") {
        throw new Error(chalk.bold.red("Please commit local changes before releasing."));
      }
    });
  }

  function compareWithDevelop() {
    return execa("git rev-list --count master..develop").then((result) => {
      if (result.stdout !== "0") {
        throw new Error(chalk.bold.red("master branch is not up-to-date with develop branch"));
      }
    });
  }

  function prompt() {
    const questions = [{
      type: "list",
      name: "version",
      message: "Which type of release is this?",
      choices: ["patch", "minor", "major", "beta"].map((type) => {
        const version = type === "beta" ?
          semver.inc(pkg.version, "prerelease", "beta") :
          semver.inc(pkg.version, type);

        return {
          name: `${type} ${chalk.dim.magenta(version)}`,
          value: version,
        };
      }).concat([
        new inquirer.Separator(),
        {
          name: "others",
          value: null,
        },
      ]),
    }, {
      type: "input",
      name: "version",
      message: `Please enter the version (current: ${pkg.version}):`,
      when: answers => !answers.version,
      validate(input) {
        if (!semver.valid(input)) {
          return "Please enter a valid semver like `a.b.c`.";
        }

        if (!semver.gt(input, pkg.version)) {
          return `New version must be greater than ${pkg.version}.`;
        }

        return true;
      },
    }, {
      type: "confirm",
      name: "confirm",
      default: false,
      message: answers => `Releasing version:${answers.version} - are you sure?`,
    }];

    return inquirer.prompt(questions);
  }

  function runTask(options) {
    if (!options.confirm) {
      process.exit(0);
    }

    const tasks = new Listr([
      {
        title: "Create bundle",
        task: () => execa("npm run bundle", {
          env: {
            SCROLLXP_VERSION: options.version,
          },
        }),
      },
      {
        title: "Compile TypeScript",
        task: async () => {
          await execa("npm run compile");

          const entry = `${BUILD_DIR}/index.js`;
          const content = fs.readFileSync(entry, "utf8");

          fs.writeFileSync(entry,
            content.replace(/__SCROLLXP_VERSION__/g, JSON.stringify(options.version)),
          );
        },
      },
      {
        title: "Commit changes",
        task: async () => {
          await execa("git add --all", { shell: true });
          await execa(`git commit -m "[Build] ${options.version}"`, { shell: true });
        }
      },
      {
        title: `Bump NPM version: ${pkg.version} -> ${options.version}`,
        task: () => execa(`npm version ${options.version}`),
      },
      {
        title: "Copy files to working directory",
        task: () => {
          cpx.copySync(joinRoot("dist/**"), `${BUILD_DIR}/dist`);
          cpx.copySync(joinRoot("package.json"), BUILD_DIR);
          cpx.copySync(joinRoot("README.md"), BUILD_DIR);
          cpx.copySync(joinRoot("LICENSE"), BUILD_DIR);
        },
      },
      {
        title: `Publish ${options.version}`,
        task: () => {
          return semver.prerelease(options.version) ?
            execa(`cd ${BUILD_DIR} && npm publish --tag beta`) :
            execa(`cd ${BUILD_DIR} && npm publish`);
        },
      },
      {
        title: "Push to GitHub",
        task: async () => {
          await execa("git push", { shell: true });
          await execa("git push --tags", { shell: true });
        },
      }
    ]);

    return tasks.run();
  }

  checkBranch()
    .then(checkWorkingTree)
    .then(compareWithDevelop)
    .then(prompt)
    .then(runTask)
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
})();
