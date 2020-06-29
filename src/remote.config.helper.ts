import * as YAML from 'yamljs';
import { Injectable } from '@nestjs/common';
import { Config } from '@jiaxinjiang/nest-config';

export enum ConfigContextType {
  JSON = 0,
  YAML = 1,
}

@Injectable()
export class RemoteConfigHelper {
  constructor() {}

  /**
   * 使用字符串深度获取对象属性
   * @param object
   * @param path
   * @param defaultValue
   */
  deepGet(object, path, defaultValue) {
    return (
      (!Array.isArray(path)
        ? path
            .replace(/\[/g, '.')
            .replace(/\]/g, '')
            .split('.')
        : path
      ).reduce((o, k) => (o || {})[k], object) || defaultValue
    );
  }

  /**
   * 深度遍历配置文件，检查模板字段，并替换。
   * @param obj
   * @param cb
   */
  depthSearch(obj, config, loop = 10) {
    if (loop < 1) {
      return;
    }
    const regular = /^\$\{(.*)+\}$/;
    for (const index in obj) {
      const item = obj[index];
      if (
        item !== null &&
        typeof item === 'object' &&
        (item.constructor === Object || Array.isArray(item))
      ) {
        this.depthSearch(item, config, loop - 1);
      } else if (typeof item === 'string' && regular.test(item)) {
        const temp = item.match(regular);
        // console.log(item,  this.deepGet(config, temp[1], ''));
        obj[index] = this.deepGet(config, temp[1], '');
      }
    }
  }

  /**
   * 获取nacos配置数据，
   * 写入到临时文件中。
   * @param agent
   */
  saveNacosRemoteConfig(
    nacosConfig: string,
    localConfig: Config,
    contentType: ConfigContextType = ConfigContextType.JSON,
  ) {
    let remoteConfig: object;
    if (!nacosConfig) {
      throw new Error('Nacos配置获取为空');
    }
    try {
      switch (contentType) {
        case ConfigContextType.JSON:
          remoteConfig = JSON.parse(nacosConfig);
          break;
        case ConfigContextType.YAML:
          remoteConfig = YAML.parse(nacosConfig);
          break;
        default:
          remoteConfig = JSON.parse(nacosConfig);
      }
      this.depthSearch(localConfig, remoteConfig);
    } catch (err) {
      throw err;
    }
    return localConfig;
  }
}
