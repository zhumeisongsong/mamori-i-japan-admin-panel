import { put, takeEvery, all, fork, call, select } from 'redux-saga/effects';
import { find } from 'lodash';
import actionTypes from './actionTypes';
import loadingActionTypes from '../Loading/actionTypes';
import feedbackActionTypes from '../Feedback/actionTypes';
import {
  getOrganizations,
  postOrganization,
  patchOrganization,
  deleteOrganization,
  getOrganization,
} from '../../apis';
import { getAccessTokenSaga } from '../Firebase/saga';
import {
  UpdateOrganizationRequestDto,
  CreateOrganizationRequestDto,
} from '../../apis/types';
import { Organization } from './types';

function* createOrganizationSaga() {
  yield takeEvery(actionTypes.CREATE_ORGANIZATION, function* _({
    payload,
  }: {
    type: string;
    payload: {
      data: CreateOrganizationRequestDto;
      callback: (data: Organization) => void;
    };
  }) {
    yield put({ type: loadingActionTypes.START_LOADING });

    yield call(getAccessTokenSaga);

    try {
      const res = yield call(postOrganization, payload.data);

      yield put({
        type: actionTypes.CREATE_ORGANIZATION_SUCCESS,
      });

      yield put({
        type: feedbackActionTypes.SHOW_SUCCESS_MESSAGE,
        payload: { successMessage: 'submitSuccess' },
      });

      const { data }: any = res;

      payload.callback(data);
    } catch (error) {
      yield put({
        type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
        payload: { errorCode: error.status, errorMessage: error.error },
      });
    }

    yield put({ type: loadingActionTypes.END_LOADING });
  });
}

function* getOrganizationsSaga() {
  yield takeEvery(actionTypes.GET_ORGANIZATIONS, function* _() {
    yield put({ type: loadingActionTypes.START_LOADING });

    yield call(getAccessTokenSaga);

    try {
      const res = yield call(getOrganizations);

      const data = res.data.map((item: Organization) => {
        return {
          ...item,
          id: item.organizationId, // adjust API change
          createdAt: item.createdAt ? item.createdAt._seconds : null,
        };
      });

      yield put({
        type: actionTypes.GET_ORGANIZATIONS_SUCCESS,
        payload: { listData: data },
      });
    } catch (error) {
      yield put({
        type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
        payload: { errorCode: error.status, errorMessage: error.error },
      });
    }

    yield put({ type: loadingActionTypes.END_LOADING });
  });
}

function* updateOrganizationSaga() {
  yield takeEvery(actionTypes.UPDATE_ORGANIZATION, function* _({
    payload,
  }: {
    type: string;
    payload: UpdateOrganizationRequestDto;
  }) {
    yield put({ type: loadingActionTypes.START_LOADING });

    yield call(getAccessTokenSaga);

    try {
      yield call(patchOrganization, payload);

      yield put({ type: actionTypes.UPDATE_ORGANIZATION_SUCCESS });

      yield put({
        type: feedbackActionTypes.SHOW_SUCCESS_MESSAGE,
        payload: { successMessage: 'submitSuccess' },
      });
    } catch (error) {
      yield put({
        type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
        payload: { errorCode: error.status, errorMessage: error.error },
      });
    }

    yield put({ type: loadingActionTypes.END_LOADING });
  });
}

function* deleteOrganizationSaga() {
  yield takeEvery(actionTypes.DELETE_ORGANIZATION, function* _({
    payload,
  }: {
    type: string;
    payload: { id: string };
  }) {
    yield put({ type: loadingActionTypes.START_LOADING });

    yield call(getAccessTokenSaga);

    try {
      yield call(deleteOrganization, payload);

      yield put({
        type: actionTypes.DELETE_ORGANIZATION_SUCCESS,
      });

      yield put({
        type: feedbackActionTypes.SHOW_SUCCESS_MESSAGE,
        payload: { successMessage: 'deleteSuccess' },
      });

      yield put({
        type: actionTypes.GET_ORGANIZATIONS,
      });
    } catch (error) {
      yield put({
        type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
        payload: { errorCode: error.status, errorMessage: error.error },
      });
    }

    yield put({ type: loadingActionTypes.END_LOADING });
  });
}

function* getOrganizationSaga() {
  yield takeEvery(actionTypes.GET_ORGANIZATION, function* _({
    payload,
  }: {
    type: string;
    payload: { id: string; callback: () => void };
  }) {
    const { listData } = yield select((state) => state.organization);
    let detailData;

    if (listData.length) {
      detailData = find(listData, payload);

      yield put({
        type: actionTypes.GET_ORGANIZATION_SUCCESS,
        payload: { detailData },
      });
    } else {
      yield call(getAccessTokenSaga);

      try {
        const res = yield call(getOrganization, payload);

        if (res) {
          detailData = res.data;

          yield put({
            type: actionTypes.GET_ORGANIZATION_SUCCESS,
            payload: { detailData },
          });
        }
      } catch (error) {
        if (error.status === 404) {
          payload.callback();
        }
        yield put({
          type: feedbackActionTypes.SHOW_ERROR_MESSAGE,
          payload: { errorCode: error.status, errorMessage: error.error },
        });
      }
    }
  });
}

function* clearOrganizationSaga() {
  yield takeEvery(actionTypes.CLEAR_ORGANIZATION, function* _() {
    yield put({
      type: actionTypes.CLEAR_ORGANIZATION_SUCCESS,
      payload: { detailData: {} },
    });
  });
}

export default function* rootSaga() {
  yield all([
    fork(createOrganizationSaga),
    fork(getOrganizationsSaga),
    fork(updateOrganizationSaga),
    fork(deleteOrganizationSaga),
    fork(getOrganizationSaga),
    fork(clearOrganizationSaga),
  ]);
}
