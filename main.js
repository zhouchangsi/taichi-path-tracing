import { pathTracing } from "./src/render/pathTracingModels/pathTracing";
import addWebGPUTrialToken from "./src/addWebGPUTrialToken";
import "./src/index.css";

addWebGPUTrialToken();
const options = {
  brightness: 10,
  size: 300,
};
pathTracing(options);

const addOptionInput = (
  option,
  default_value,
  min = 0,
  max = default_value * 2
) => {
  const input = document.createElement("input");
  input.type = "range";
  input.min = min;
  input.max = max;
  input.value = default_value;

  const show = document.createElement("div");
  show.innerText = option + ": " + default_value;

  input.oninput = function () {
    options[option] = Number.parseFloat(this.value);
    show.innerText = option + ": " + this.value;
    pathTracing(options);
  };

  const wrapper = document.querySelector("#wrapper");
  wrapper.append(show);
  wrapper.append(input);
};

for (let [key, value] of Object.entries(options)) {
  addOptionInput(key, value);
}