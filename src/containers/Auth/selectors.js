import { createSelector } from 'reselect';

const selectAuth = state => state.auth;

const selectToken = createSelector(selectAuth, authState => authState.accessToken);

const selectTokenId = createSelector(selectAuth, authState => authState.tokenId);

const selectRefreshToken = createSelector(selectAuth, authState => authState.refreshToken);

const selectExpiresIn = createSelector(selectAuth, authState => authState.expiresIn);

const selectReceivedAt = createSelector(selectAuth, authState => authState.receivedAt);

const selectExp = createSelector([selectExpiresIn, selectReceivedAt], (expiresIn, receivedAt) => {
  let expires;
  if (expiresIn && receivedAt) {
    expires = new Date(Date.parse(receivedAt) + parseInt(expiresIn, 10) * 1000);
  }
  return expires;
});

const selectErrorCode = createSelector(selectAuth, authState => authState.errorcode);

const selectError = createSelector(selectAuth, authState => authState.error);

const selectRefreshing = createSelector(selectAuth, authState => authState.refreshing);

const selectRefreshErr = createSelector(selectAuth, authState => authState.refreshErr);

const selectLastRefreshAt = createSelector(selectAuth, authState => authState.lastRefreshAt);

const selectSubmitting = createSelector(selectAuth, authState => authState.submitting);

const selectOptSuccess = createSelector(selectAuth, authState => authState.optSuccess);

export { selectAuth, selectToken, selectTokenId, selectRefreshToken, selectExp, selectError, selectErrorCode, selectRefreshing, selectRefreshErr, selectLastRefreshAt, selectSubmitting, selectOptSuccess };
