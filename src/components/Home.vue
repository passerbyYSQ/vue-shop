<template>

  <el-container class="home-container">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/logo.png" alt="logo">
        <span>后台管理系统</span>
      </div>
      <div>
        <span>admin</span>
        <el-button type="info" @click="logout" size="mini">退出</el-button>
      </div>
    </el-header>

    <!-- 主体区域 -->
    <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 展开和收起的按钮 -->
        <div class="toggle-button" @click="toggleCollapse">|||</div>
        <el-progress :text-inside="true" :stroke-width="16" :percentage="percentage"
                     :color="customColors"></el-progress>
        <!-- 侧边栏菜单 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          router
          unique-opened
          :collapse="isCollapse"
          :collapse-transition="false"
          active-text-color="#409eff"
          :default-active="$route.path">

          <!-- 一级菜单  -->
          <!-- index必须不同，否则点击事件会影响所有。
          index必须是字符串类型，而item.id是数字类型，需要拼接一个空串来转换 -->
          <el-submenu :index=" item.id + '' " v-for="item in menuList" :key="item.id">
            <!-- 一级菜单标题模板 -->
            <template slot="title">
              <i :class=" 'iconfont ' + icons[item.id] "></i>
              <span>{{ item.authName }}</span>
            </template>

            <!-- 二级菜单 -->
            <el-menu-item :index=" '/' + subItem.path " v-for="subItem in item.children"
                          :key="subItem.id">
              <template slot="title">
                <i class="el-icon-menu"></i>
                <span>{{ subItem.authName }}</span>
              </template>
            </el-menu-item>

          </el-submenu>

        </el-menu>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- 路由占位符 -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>

</template>

<script>
  export default {
    name: 'Home',
    data() {
      return {
        // 左侧菜单数据
        menuList: [],
        // 一级菜单的icon
        icons: {
          125: 'icon-user',
          103: 'icon-tijikongjian',
          101: 'icon-3702mima',
          102: 'icon-danju',
          145: 'icon-baobiao'
        },
        // 是否折叠（收起）
        isCollapse: false,
        // 已用空间
        percentage: 20
      }
    },
    created() {
      this.getMenuList();
    },
    methods: {
      logout() {
        window.sessionStorage.clear();
        this.$router.push('/login');
      },
      // 获取所有的菜单项
      async getMenuList () {
        const { data: res } = await this.$http.get('menus');
        if (res.meta.status === 200) {
          this.menuList = res.data;
          // console.log(this.menuList);
        } else {
          this.$message.error(res.meta.msg);
        }
      },
      // 展开或折叠菜单
      toggleCollapse() {
        this.isCollapse = !this.isCollapse;
      },
      // 进度条的颜色规则
      customColors() {
        if (this.percentage < 30) {
          return '#67c23a';
        } else if (this.percentage < 70) {
          return '#e6a23c';
        } else {
          return '#f56c6c';
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .home-container {
    height: 100%;
  }
  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    /* 不加，按钮会变形，上下会被拉伸 */
    align-items: center;
    color: #fff;
    font-size: 20px;

    > div {
      display: flex;
      align-items: center;

      /* div的高被图片撑开 */
      img {
        height: 44px;
      }
      span {
        margin: 0 15px;
      }
    }

  }
  .el-aside {
    background-color: #333744;

    .toggle-button {
      background-color: #4a5064;
      font-size: 10px;
      color: #fff;
      text-align: center;
      line-height: 32px;
      align-items: center;
      letter-spacing: 0.2em;
      cursor: pointer;
    }

    .el-progress {
      margin: 16px 4px;
    }

    /* el-menu会有一个1px的边框。如果不去掉，会造成右边缘对不齐 */
    .el-menu {
      border-right: none;

      .iconfont {
        margin-right: 10px;
      }
    }
  }
  .el-main {
    background-color: #eaedf1;
  }

</style>
