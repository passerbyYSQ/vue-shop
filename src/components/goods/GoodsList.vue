<template>
  <div>
    <el-card>
      <div slot="header">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品分列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div>
        <el-row type="flex" justify="space-between">
          <el-col :span="6">
            <el-button type="primary" @click="$router.push('/goods/add')">添加商品</el-button>
          </el-col>
          <el-col :span="6">
            <!-- 搜索 -->
            <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable
                      @clear="onSearch" @keyup.enter.native="onSearch">
              <el-button slot="append" icon="el-icon-search"
                         @click="onSearch"></el-button>
            </el-input>
          </el-col>
        </el-row>

        <!-- 商品列表表格 -->
        <el-table :data="goodsList" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="商品名称" prop="goods_name"></el-table-column>
          <el-table-column label="商品价格(元)" prop="goods_price" width="95"></el-table-column>
          <el-table-column label="商品重量" prop="goods_weight" width="80"></el-table-column>
          <el-table-column label="创建时间" prop="add_time" width="160">
            <template v-slot="scope">
              {{ scope.row.add_time | dateFormat }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="130">
            <template v-slot="scope">
              <el-button type="primary" icon="el-icon-edit" size="mini"></el-button>
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeById(scope.row.goods_id)"></el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页区域 -->
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 3, 5, 10, 16]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>

      </div>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'List',
    data () {
      return {
        // 查询参数
        queryInfo: {
          query: this.$route.query.query ? this.$route.query.query : '', // 关键词
          pagenum: this.$route.query.page ? parseInt(this.$route.query.page) : 1, // 当前页
          pagesize: this.$route.query.size ? parseInt(this.$route.query.size) : 5 // 每页多少条数据
        },
        goodsList: [], // 商品列表
        total: 0, // 总的记录数
      }
    },
    created () {
      this.getGoodsList()
    },
    methods: {
      // 请求商品列表
      async getGoodsList () {
        const { data: res } = await this.$http.get('goods', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        this.goodsList = res.data.goods
        this.total = res.data.total
        // 后端为什么不返回pagenum？后端对于越界的pagenum，可以纠正进行返回
      },
      // 当前页改变
      handleCurrentChange (newPage) {
        this.queryInfo.pagenum = newPage
        // 路径拼接参数
        const route = {
          path: this.$route.path,
          query: {
            page: newPage,
            size: this.queryInfo.pagesize
          }
        }
        if (this.queryInfo.query) {
          route.query.query = this.queryInfo.query
        }

        this.$router.replace(route)
        this.getGoodsList()
      },
      // 分页size改变时的回调
      handleSizeChange (newSize) {
        this.queryInfo.pagenum = 1 // pager指向第一页
        this.queryInfo.pagesize = newSize
        // 路径拼接参数
        const route = {
          path: this.$route.path,
          query: {
            page: 1,
            size: newSize
          }
        }
        if (this.queryInfo.query) { // 关键词不为空
          route.query.query = this.queryInfo.query
        }

        this.$router.replace(route)
        this.getGoodsList()
      },
      onSearch () {
        this.queryInfo.pagenum = 1 // 为了让pager回到第1。不能少！！！
        // 路径拼接参数 关键字参数，这样刷新不会丢失
        const route = {
          path: this.$route.path,
          query: {
            page: 1, // 数据来源是第一页
            size: this.queryInfo.pagesize
          }
        }
        if (this.queryInfo.query) {
          route.query.query = this.queryInfo.query
        }
        this.$router.replace(route)
        this.getGoodsList()
      },
      // 删除某个商品
      async removeById (goodsId) {

        const confirmResult = await this.$confirm('此操作将永久删除该商品, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)

        if (confirmResult !== 'confirm') {
          // 取消删除
          return
        }

        const { data: res } = await this.$http.delete(`goods/${goodsId}`)
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success(res.meta.msg)
        this.getGoodsList()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
