import environment from "@theflow/configs/environment";
import httpService from "@theflow/services/api";

export class FlowService {

  static async updateFlow(code, data) {
    const response = await httpService.put(environment.API.FLOW.INFO + "/" + code, data);
    return response.data;
  }

  static async fetchGetFlow(code) {
    const response = await httpService.get(environment.API.FLOW.INFO + "/" + code);
    return response.data;
  }

  static async saveNodes(code, data) {
    const response = await httpService.post(environment.API.FLOW.INFO + "/" + code + "/nodes", data);
    return response.data;
  }

  static async updateNodes(code, code_nodes, data) {
    const response = await httpService.put(environment.API.FLOW.INFO + "/" + code + "/nodes/" + code_nodes, data);
    return response.data;
  }

  static async updateContentNodes(code, code_nodes, data) {
    const response = await httpService.put(environment.API.FLOW.INFO + "/" + code + "/nodes/" + code_nodes + "/content", data);
    return response.data;
  }

  static async uploadFileNodes(code, code_nodes, data) {
    const response = await httpService.put(environment.API.FLOW.INFO + "/" + code + "/nodes/" + code_nodes + "/content", data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  static async deleteNodes(code, code_nodes) {
    const response = await httpService.delete(environment.API.FLOW.INFO + "/" + code + "/nodes/" + code_nodes);
    return response.data;
  }


  static async connectEdges(code, data) {
    const response = await httpService.post(environment.API.FLOW.INFO + "/" + code + "/edges", data);
    return response.data;
  }


  static async deleteEdges(code, source, target) {
    const response = await httpService.delete(environment.API.FLOW.INFO + "/" + code + "/edges/" + source + "/" + target);
    return response.data;
  }

}

