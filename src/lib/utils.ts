import settings from "@/config/app";
import { clsx, type ClassValue } from "clsx"
import moment from "moment";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeDiffFromNow(timestamp: Date) {
  const now = moment();
  const then = moment(timestamp);
  const diffInSeconds = now.diff(then, 'seconds');

  if (diffInSeconds < 10) {
    return 'just now';
  }

  if (diffInSeconds < 60) {
    return '1 min';
  }

  const diffInMinutes = now.diff(then, 'minutes');
  if (diffInMinutes < 60) {
    return `${diffInMinutes} min${diffInMinutes > 1 ? 's' : ''}`;
  }

  const diffInHours = now.diff(then, 'hours');
  if (diffInHours < 24) {
    return `${diffInHours} hr${diffInHours > 1 ? 's' : ''}`;
  }

  const diffInDays = now.diff(then, 'days');
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''}`;
  }

  const diffInWeeks = now.diff(then, 'weeks');
  if (diffInWeeks < 4) {
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''}`;
  }

  const diffInMonths = now.diff(then, 'months');
  if (diffInMonths < 12) {
    return `${diffInMonths} month${diffInMonths > 1 ? 's' : ''}`;
  }

  const diffInYears = now.diff(then, 'years');
  return `${diffInYears} yr${diffInYears > 1 ? 's' : ''}`;
}

export const parseAndReturnAPIurl = (url: string) => {
  const urlParts = url.split('/');
  const serviceNameRaw = urlParts[0];
  const serviceNameRegex = /^<[^<>]+>$/;
  if (!serviceNameRegex.test(serviceNameRaw)) {
      return url;
  }
  let baseURL = serviceNameRaw === 'nextApi' ? settings.nextApi : '';
  const serviceName = serviceNameRaw.replace('<', '').replace('>', '') as keyof typeof settings.services;
  if (!baseURL.length) {
      baseURL = settings.services[serviceName].baseURL;
  }
  if (!baseURL) {
    throw new Error(`Unknown service: ${serviceName}`);
  }

  const relativePath = urlParts.slice(1).join('/');
  return `${baseURL}/${relativePath}`;
}

export const isObject = (val: any) =>
  val && typeof val === 'object' && !Array.isArray(val);

export const merge = (obj1: Record<string, any>, obj2: Record<string, any>, mergeLeafNodes = true): Record<string, any> => {
  const newObj: Record<string, any> = { ...obj1 };
  for (const key of Object.keys(obj2)) {
    const val1 = obj1[key];
    const val2 = obj2[key];
    if (Array.isArray(val1) && Array.isArray(val2)) {
      if (!mergeLeafNodes) {
        newObj[key] = val2;
        continue;
      }
      const modifiedVal2s = [...val1];
      for (const val of val2) {
        if (!isObject(val)) {
          const existingVal = val1.find((v1) => v1 === val);
          if (!existingVal) {
            modifiedVal2s.push(val);
          }
          continue;
        }
        const { identifier } = val as Record<string, any>;
        const objFromVal1 = val1.find((v1) => {
          if (!isObject(v1)) return false;
          const { identifier: identifierV1 } = v1;
          if (identifier === identifierV1) return true;
        });

        if (!objFromVal1) {
          modifiedVal2s.push(val);
          continue;
        }

        const newObj = {
          ...objFromVal1,
          ...val
        };

        modifiedVal2s.push(newObj);
      }
      newObj[key] = modifiedVal2s;
    }
    else if (isObject(val1) && isObject(val2)) {
      if (!mergeLeafNodes) {
        newObj[key] = val2;
        continue;
      }
      newObj[key] = merge(val1, val2, mergeLeafNodes);
    } 
    else {
      newObj[key] = val2;
    }
  }
  return newObj;
};

export function getFileStatusFromRemoteFile(file: Record<string, any>) {
  if (file.uploadedAt && !file.processedAt) return 'uploading';
  if (file.processedAt) return 'successful';
  if (file.uploadedAt) return 'uploaded';
}