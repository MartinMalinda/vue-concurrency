import * as Vue from "vue2";
import CompositionApi from "@vue/composition-api";

Vue.default.use(CompositionApi);

jest.mock("../src/utils/api", () => jest.requireActual("../src/utils/api2"));
