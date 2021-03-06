import { FirebaseDate } from '../../apis/types';

export interface Organization {
  key: string;
  id: string;
  organizationId: string;
  name: string;
  message: string;
  organizationCode: string;
  addedByAdminUserId: string;
  addedByAdminEmail: string;
  createdAt: FirebaseDate;
  updatedAt: FirebaseDate;
}

export type DetailDataState = Organization | {};

export type ListDataState = Organization[];

export type OrganizationStates = {
  listData: ListDataState;
  detailData: DetailDataState;
};
