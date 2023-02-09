import { colorOnly } from "./src";
import { fractal3D } from "./src/render/fractal3D";
import addWebGPUTrialToken from "./src/addWebGPUTrialToken";
import "./src/index.css"

addWebGPUTrialToken()
const options = {
    brightness: 10,
    size: 300
}
colorOnly(options)

const addOptionInput = (option, default_value, min = 0, max = default_value * 2) => {
    const input = document.createElement("input")
    input.type = "range"
    input.value = default_value
    input.min = min
    input.max = max

    const show = document.createElement('div')
    show.innerText = option + ': ' + default_value

    input.oninput = function () {
        options[option] = Number.parseFloat(this.value)
        show.innerText = option + ': ' + this.value
        colorOnly(options)
    }
    const body = document.body
    const wrapper = document.createElement("div")
    wrapper.append(show)
    wrapper.append(input)
    body.append(wrapper)
}

for (let [key, value] of Object.entries(options)) {
    addOptionInput(key, value)
}
