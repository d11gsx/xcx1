import http from "./http"

// 基本配置接口
function getFrSet(data) {
  return http({
    url: '/api/wx-set?populate=*',
    data,
    method: "GET",
  })
}

// 分类目录 v4.2
function getCategory(page, type) {
  return http({
    url: '/api/categories?pagination[page]=' + page + type,
    method: "GET",
  })
}

/**
 **资源下载相关接口
 **/
// 首页资源置顶接口
function getHost(data) {
  return http({
    url: '/api/posts?sort=updatedAt:desc' + data,
    method: "GET",
  })
}
// 资源下载详情接口
function getInfo(data) {
  return http({
    url: '/api/posts/' + data + '?populate=*',
    method: "GET",
  })
}
// 资源下载列表 20230823 按更新时间排序
function getLists(data) {
  return http({
    url: '/api/posts?sort=updatedAt:desc&populate[category][fields][0]=type&pagination[page]=' + data,
    method: "GET",
  })
}

// 分类文章
function getCategoryList(data, page) {
  return http({
    url: '/api/posts?sort=updatedAt:desc&populate[category][fields][0]=type&filters[category][id]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 请求搜索
function getSearchList(data, page) {
  return http({
    url: '/api/posts?sort=updatedAt:desc&populate[category][fields][0]=type&filters[title][$containsi]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}



/**
 **用户相关接口
 **/
// 用户注册
function userRegister(data) {
  return http({
    url: '/api/auth/local/register',
    method: "POST",
    data
  })
}
// 用户登录
function userLocal(data) {
  return http({
    url: '/api/auth/local',
    method: "POST",
    data
  })
}
// 用户基本信息
function userInfoMe(header) {
  return http({
    url: '/api/users/me',
    method: "GET",
    header: header
  })
}


/**
 **文档阅读相关接口
 **/
// 文档详情接口
function getDocsInfo(data) {
  return http({
    url: '/api/docs/' + data + '?populate=*',
    method: "GET",
  })
}
// 文档列表
function getDocsLists(data, ) {
  return http({
    url: '/api/docs?sort=updatedAt:desc&populate[category][fields][0]=type&pagination[page]=' + data,
    method: "GET",
  })
}
// 文档分类
function getDocsCategoryList(data, page) {
  return http({
    url: '/api/docs?sort=id:desc&populate[category][fields][0]=type&filters[category][id]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 文档搜索
function getDocsSearchList(data, page) {
  return http({
    url: '/api/docs?sort=id:desc&populate[category][fields][0]=type&filters[title][$containsi]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 文档置顶接口
function getDocsHost(data) {
  return http({
    url: '/api/docs?sort=updatedAt:desc' + data,
    method: "GET",
  })
}

/**
 **壁纸关接口
 **/
// 壁纸分类
function getWallCategoryList(data, page) {
  return http({
    url: '/api/walls?sort=id:desc&populate[category][fields][0]=type&filters[category][id]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 壁纸列表
function getWallLists(data) {
  return http({
    url: '/api/walls?sort=updatedAt:desc&populate[category][fields][0]=type&pagination[page]=' + data,
    method: "GET",
  })
}
// 壁纸详情接口
function getWallInfo(data) {
  return http({
    url: '/api/walls/' + data + '?populate=*',
    method: "GET",
  })
}
// 壁纸搜索
function getWsllsSearchList(data, page) {
  return http({
    url: '/api/walls?sort=id:desc&populate[category][fields][0]=type&filters[title][$containsi]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 壁纸置顶接口
function getWallHost(data) {
  return http({
    url: '/api/walls?sort=updatedAt:desc' + data,
    method: "GET",
  })
}

/**
 **红包封面关接口
 **/
// 红包封面分类
function getRedEnvelopesCategoryList(data, page) {
  return http({
    url: '/api/red-envelopes?sort=id:desc&populate[category][fields][0]=type&filters[category][id]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 红包封面列表
function getRedEnvelopesList(data) {
  return http({
    url: '/api/red-envelopes?sort=updatedAt:desc&populate[category][fields][0]=type&pagination[page]=' + data,
    method: "GET",
  })
}
// 红包封面详情接口
function getRedEnvelopesInfo(data) {
  return http({
    url: '/api/red-envelopes/' + data + '?populate=*',
    method: "GET",
  })
}
// 红包封面搜索
function getRedEnvelopesSearchList(data, page) {
  return http({
    url: '/api/red-envelopes?sort=id:desc&populate[category][fields][0]=type&filters[title][$containsi]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 红包置顶接口
function getRedEnvelopesHost(data) {
  return http({
    url: '/api/red-envelopes?sort=updatedAt:desc' + data,
    method: "GET",
  })
}


/**
 ** 考公相关接口
 **/

// 考公列表
function getSubjects(data) {
  return http({
    url: '/api/subjects?sort=updatedAt:desc&populate[category][fields][0]=type&pagination[page]=' + data,
    method: "GET",
  })
}
// 考公分类
function getSubjectsLists(data, page) {
  return http({
    url: '/api/subjects?sort=id:desc&populate[category][fields][0]=type&filters[category][id]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 考公搜索
function getSubjectsSearchList(data, page) {
  return http({
    url: '/api/subjects?sort=id:desc&populate[category][fields][0]=type&filters[title][$containsi]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 考公详情接口 strapi填充2级深度answer
function getSubjectsInfo(data) {
  return http({
    url: '/api/subjects/' + data + '?populate[0]=topic&populate[1]=topic.answer&populate[2]=material',
    method: "GET",
  })
}
// 考公置顶接口
function getSubjectsHost(data) {
  return http({
    url: '/api/subjects?sort=updatedAt:desc' + data,
    method: "GET",
  })
}

/**
 ** 刷题相关接口
 **/

// 刷题列表
function getBrush(data) {
  return http({
    url: '/api/brush-questions?sort=updatedAt:desc&populate[category][fields][0]=type&pagination[page]=' + data,
    method: "GET",
  })
}
// 刷题分类
function getBrushLists(data, page) {
  return http({
    url: '/api/brush-questions?sort=id:desc&populate[category][fields][0]=type&filters[category][id]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 刷题搜索
function getBrushSearchList(data, page) {
  return http({
    url: '/api/brush-questions?sort=id:desc&populate[category][fields][0]=type&filters[title][$containsi]=' + data + '&pagination[page]=' + page,
    method: "GET",
  })
}
// 刷题详情接口 strapi填充2级深度options
function getBrushInfo(data) {
  return http({
    url: '/api/brush-questions/' + data + '?populate[0]=brush&populate[1]=brush.options',
    method: "GET",
  })
}
// 刷题置顶接口
function getBrushHost(data) {
  return http({
    url: '/api/brush-questions?sort=updatedAt:desc' + data,
    method: "GET",
  })
}

// 一言接口
function getSpeech() {
  return http({
    url: '/api/speech?populate=*&sort=updatedAt:desc',
    method: "GET",
  })
}


// 导出接口
export {

  // 基本配置接口
  getFrSet,

  /**
   **资源下载相关接口
   **/
  getHost,
  getInfo,
  getLists,
  getCategory,
  getCategoryList,
  getSearchList,

  /**
   **用户相关接口
   **/
  userLocal,
  userInfoMe,
  userRegister,

  /**
   **文档阅读相关接口
   **/
  getDocsLists,
  getDocsInfo,
  getDocsCategoryList,
  getDocsSearchList,
  getDocsHost,

  /**
   **壁纸下载相关接口
   **/
  getWallLists,
  getWallInfo,
  getWallCategoryList,
  getWsllsSearchList,
  getWallHost,

  /**
   **红包相关接口
   **/
  getRedEnvelopesCategoryList,
  getRedEnvelopesInfo,
  getRedEnvelopesList,
  getRedEnvelopesSearchList,
  getRedEnvelopesHost,

  /**
   ** 考公相关接口
   **/
  getSubjectsLists,
  getSubjectsSearchList,
  getSubjects,
  getSubjectsInfo,
  getSubjectsHost,

  /**
   ** 刷题相关接口
   **/
  getBrushLists,
  getBrushSearchList,
  getBrush,
  getBrushInfo,
  getBrushHost,

  /**
   ** 一言接口
   **/
  getSpeech,
}