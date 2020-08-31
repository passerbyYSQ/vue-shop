<template>
  <div>
    <el-card>
      <div slot="header">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>商品分类</el-breadcrumb-item>
        </el-breadcrumb>
      </div>

      <div>
        <el-row type="flex" justify="space-between">
          <el-col :span="6">
            <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
          </el-col>
        </el-row>

        <!-- 表格
          :selection-type="false" ： 去除复选框
          :expand-type="false" ： 去除展开行
          border : 纵向分割线
          -->
        <tree-table class="margin-top-16" :data="cateList" :columns="columns" show-index index-text="#"
                    :selection-type="false" :expand-type="false" border>
          <!--
          是否有效
          slot="isOk" slot-scope="scope"
          color="lightgreean"
           或者 v-slot:isOk="scope"
            -->
          <template v-slot:isOk="scope">
            <i class="el-icon-success" style="color: #67C23A;" v-if="scope.row.cat_deleted === false"></i>
            <i class="el-icon-error" style="color: #F56C6C;" v-else></i>
          </template>

          <!-- 排序 -->
          <template v-slot:level="scope">
            <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
            <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
            <el-tag type="warning" size="mini" v-else>三级</el-tag>
          </template>

          <!-- 操作 -->
          <template v-slot:operate="">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
          </template>
        </tree-table>

        <!-- 分页按钮  -->
        <!-- 分页
        :page-sizes="[1, 2, 5, 8, 10]"
        @size-change="handleSizeChange"-->
        <el-pagination
          @current-change="handleCurrentChange"
          @size-change="handleSizeChange"
          :current-page.sync="queryInfo.pagenum"
          :page-sizes="[1, 2, 3, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total" background>
        </el-pagination>

      </div>

      <el-dialog
        title="添加分类"
        :visible.sync="addCateDialogVisible"
        width="36%" @close="addCateDialogClosed">
        <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRef" label-width="80px">
          <el-form-item label="分类名称" prop="cat_name">
            <el-input v-model="addCateForm.cat_name"></el-input>
          </el-form-item>
          <el-form-item label="父级分类">
            <el-cascader
              v-model="selectedPids" :options="parentCates" clearable placeholder="一级分类不需要选择父分类"
              :props="cascaderProps" @change="parentCateChanged">
            </el-cascader>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false" size="medium">取 消</el-button>
        <el-button type="primary" @click="addCate" size="medium">确 定</el-button>
      </span>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
  export default {
    name: 'Cate',
    data () {
      return {
        cateList: [], // 所有分类信息
        queryInfo: {  // 请求api携带的参数，同时绑定界面元素
          type: 3, // 3级分类全要
          pagenum: this.$route.query.page ? parseInt(this.$route.query.page) : 1, // 当前页
          pagesize: this.$route.query.size ? parseInt(this.$route.query.size) : 5 // 每页多少条数据
        },
        total: 0,
        addCateDialogVisible: false, // 添加分类的对话框的显示
        addCateForm: { // 添加分类的表单的数据对象
          cat_name: '', // 新增分类的名称
          cat_pid: 0, // 新增分类的父分类的id。0：无父分类
          cat_level: 0 // 分类等级。0：一级分类，1：二级分类，2：三级分类
        },
        addCateFormRules: {  // 添加分类的表单的验证规则对象
          cat_name: [
            { required: true, message: '请输入分类名称', trigger: 'blur' },
            { min: 3, max: 32, message: '长度在 3~32 字符之间', trigger: 'blur' }
          ]
        },
        parentCates: [], // 所有父级分类（一、二级分类）
        cascaderProps: { // 级联选择器的配置对象
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children',
          checkStrictly: true
        },
        selectedPids: [], // 选中父级分类的id数组
        columns: [ // tree-table的各列的配置
          {
            label: '分类名称',
            prop: 'cat_name',
          },
          {
            label: '是否有效',
            type: 'template', // 当前列为自定义模板列
            template: 'isOk' // 模板标签的名称
          },
          {
            label: '级别',
            type: 'template',
            template: 'level'
          },
          {
            label: '操作',
            type: 'template',
            template: 'operate'
          }
        ]
      }
    },
    created () {
      this.getCateList()
    },
    methods: {
      showAddCateDialog() {
        this.getParentCates();
        this.addCateDialogVisible = true;
      },
      // 获取分类数据
      async getCateList () {
        console.log(this.queryInfo)
        const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // console.log(res.data);
        this.cateList = res.data.result
        this.total = res.data.total
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
        this.getCateList()
      },
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
        if (this.queryInfo.query) {
          route.query.query = this.queryInfo.query
        }

        this.$router.replace(route)
        this.getCateList()
      },
      // 获取父级分类（一二级分类）
      async getParentCates() {
        const { data: res } = await this.$http.get('categories', { params: { type: 2 } });
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        // console.log(res.data);
        this.parentCates = res.data;
      },
      // 级联选择器，选择项发生变化时的回调函数
      parentCateChanged() {
        // console.log(this.selectedPids);
        // 选中了父级分类
        if (this.selectedPids.length > 0) {
          // 父级分类的id
          this.addCateForm.cat_pid = this.selectedPids[this.selectedPids.length - 1];
          // 新建分类的等级
          this.addCateForm.cat_level = this.selectedPids.length;
        } else {
          this.addCateForm.cat_pid = 0;
          this.addCateForm.cat_level = 0;
        }
        // console.log(this.addCateForm);
      },
      // 添加分类对话框的关闭时的回调函数，清空表单
      addCateDialogClosed() {
        this.$refs.addCateFormRef.resetFields();
        this.selectedPids = [];
        this.addCateForm.cat_level = 0;
        this.addCateForm.cat_pid = 0;
      },
      addCate() {
        // console.log(this.addCateForm);
        this.$refs.addCateFormRef.validate(async valid => {
          if (!valid) {
            return;
          }
          const { data: res } = await this.$http.post('categories', this.addCateForm);
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getCateList();
          this.addCateDialogVisible = false;
        });
      }
    }
  }
</script>

<style lang="less" scoped>
  .margin-top-16 {
    margin-top: 16px;
  }
</style>
