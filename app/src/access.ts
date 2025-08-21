/**
 * @see https://umijs.org/docs/max/access#access
 * */
export default function access(initialState: { currentUser?: API.CurrentUser } | undefined) {
  const { currentUser } = initialState ?? {};
  return {
    canAdmin: currentUser && currentUser.isAdmin === true,
    canSystem: currentUser && currentUser.isAdmin === true, // 系统管理权限
  };
}
