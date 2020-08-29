<template>
    <div>
      <el-card>
        <div slot="header">
          <!-- 面包屑导航 -->
          <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>权限列表</el-breadcrumb-item>
          </el-breadcrumb>
        </div>

        <el-table :data="rightsList" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="权限名称" prop="authName"></el-table-column>
          <el-table-column label="路径" prop="path"></el-table-column>
          <el-table-column label="权限等级" prop="level">
            <template v-slot="scope">
              <el-tag v-if="scope.row.level === '0'">一级</el-tag>
              <el-tag type="success" v-if="scope.row.level === '1'">二级</el-tag>
              <el-tag type="warning" v-if="scope.row.level === '2'">三级</el-tag>
            </template>
          </el-table-column>
        </el-table>

      </el-card>
    </div>
</template>

<script>
  export default {
    name: 'Permission',
    data() {
      return {
        // 权限列表
        rightsList: []
      }
    },
    created () {
      this.getRightsList();
    },
    methods: {
      async getRightsList() {
        const { data: res} = await this.$http.get('rights/list');
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg);
        } else {
          this.rightsList = res.data;
          // console.log(res.data);
        }
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
