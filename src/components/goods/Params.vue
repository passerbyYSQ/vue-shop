<template>
  <div>
    <el-card>
      <div slot="header">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>商品管理</el-breadcrumb-item>
          <el-breadcrumb-item>参数列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <!-- 警告区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！" type="warning" show-icon>
      </el-alert>

      <!-- 选择商品分类 -->
      <div style="margin: 16px 0;">
        <span>选择商品分类：</span>
        <!-- 级联选择框 -->
        <el-cascader v-model="selectedIds" :options="cateList" :props="cateProps"
                     @change="handleCateChanged">
        </el-cascader>
      </div>

      <!-- tabs页签 -->
      <el-tabs v-model="activeTabName" @tab-click="handleTabClick" type="card">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <div>
            <el-button type="primary" @click="addDialogVisible = true" size="medium" :disabled="isBtnDisabled">添加参数</el-button>
          </div>
          <el-table :data="dynamicParamsData" border stripe>
            <el-table-column type="expand">
              <template v-slot="scope">
                <!-- 循环渲染tag -->
                <el-tag closable @close="handleTagClose(i, scope.row)"
                        v-for="(item, i) in scope.row.attr_vals" :key="i">{{ item }}</el-tag>
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.tagInputVisible"
                  v-model="scope.row.tagInputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleTagInputConfirm(scope.row)"
                  @blur="handleTagInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template v-slot="scope">
                <el-button type="primary" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini">编辑</el-button>
                <el-button type="danger" @click="removeAttr(scope.row.attr_id)" icon="el-icon-delete" size="mini">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <div>
            <el-button type="primary" @click="addDialogVisible = true" size="medium" :disabled="isBtnDisabled">添加属性</el-button>
            <!-- 静态属性的表格 -->
            <el-table :data="staticPropsData" border stripe>
              <el-table-column type="expand">
                <template v-slot="scope">
                  <!-- 循环渲染tag -->
                  <el-tag closable @close="handleTagClose(i, scope.row)"
                          v-for="(item, i) in scope.row.attr_vals" :key="i">{{ item }}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.tagInputVisible"
                    v-model="scope.row.tagInputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleTagInputConfirm(scope.row)"
                    @blur="handleTagInputConfirm(scope.row)"
                  >
                  </el-input>
                  <el-button v-else size="small" @click="showTagInput(scope.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index" label="#"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot="scope">
                  <el-button type="primary" @click="showEditDialog(scope.row.attr_id)" icon="el-icon-edit" size="mini" >编辑</el-button>
                  <el-button type="danger"  @click="removeAttr(scope.row.attr_id)" icon="el-icon-delete" size="mini">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>
        </el-tab-pane>
      </el-tabs>

    </el-card>

    <!-- 添加对话框 -->
    <el-dialog @close="addDialogClosed"
      :title="'添加' + titleText" :visible.sync="addDialogVisible" width="36%">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false" size="medium">取 消</el-button>
          <el-button type="primary" @click="addAttr" size="medium">确 定</el-button>
        </span>
    </el-dialog>

    <!-- 修改对话框 -->
    <el-dialog @close="editDialogClosed"
      :title="'修改' + titleText" :visible.sync="editDialogVisible" width="36%" >
      <el-form :model="editForm" :rules="addFormRules" ref="editFormRef" label-width="80px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="editDialogVisible = false" size="medium">取 消</el-button>
    <el-button type="primary" @click="editAttr" size="medium">确 定</el-button>
  </span>
    </el-dialog>


  </div>
</template>

<script>
  export default {
    name: 'Params',
    data () {
      return {
        cateList: [], // 商品分类
        cateProps: { // 级联选择框的配置对象
          expandTrigger: 'hover',
          value: 'cat_id',
          label: 'cat_name',
          children: 'children'
        },
        selectedIds: [], // 级联选择框选中的分类，是一个数组
        activeTabName: 'many', // 当前被激活的tab
        dynamicParamsData: [], // 动态参数的数据
        staticPropsData: [], // 静态属性的数据
        addDialogVisible: false, // 添加对话框是否可见
        addForm: {
          attr_name: ''
        },
        addFormRules: {
          attr_name: [
            { required: true, message: '请输入名称', trigger: 'blur' },
            { min: 2, max: 64, message: '长度在 2~64 个字符之间', trigger: 'blur' }
          ]
        },
        editDialogVisible: false, // 编辑对话框是否显示
        editForm: {},
    }
    },
    created () {
      // 获取所有的商品分类
      this.getCateList()
    },
    methods: {
      // 获取分类数据
      async getCateList () {
        // console.log(this.queryInfo)
        const { data: res } = await this.$http.get('categories')
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }
        // console.log(res.data);
        this.cateList = res.data
      },
      // 级联选择框 选中项 变化时的回调
      handleCateChanged () {
        // console.log(this.selectedIds);
        // 只能选择三级分类（注意叶子节点不一定是三级分类，也有可能是二级或一级）
        if (this.selectedIds.length !== 3) {
          this.selectedIds = [];
          this.dynamicParamsData = [];
          this.staticPropsData = [];
          return
        }
        // 请求
        this.getParamsData()
      },
      // tab被点击时的回校
      handleTabClick () {
        // console.log(this.activeTabName);
        this.getParamsData()
      },
      // 获取参数列表
      async getParamsData () {
        if (!this.selectedCateId) {
          return
        }
        // 根据所选分类和当前所处的面板，发起请求获取对应数据
        const { data: res } = await this.$http.get(`categories/${this.selectedCateId}/attributes`, {
          params: { sel: this.activeTabName }
        })
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg)
        }

        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : [];
          item.tagInputVisible = false; // 增加tag的按钮和文本框的切换
          item.tagInputValue = ''; // 即将新增的tag的名称
        });
        console.log(res.data);

        if (this.activeTabName === 'many') { // 动态参数
          this.dynamicParamsData = res.data
        } else if (this.activeTabName === 'only') { // 静态属性
          this.staticPropsData = res.data
        }
      },
      // 添加对话框关闭的回调
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      // 确认添加属性或参数
      addAttr() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return;
          }
          const { data: res} = await this.$http.post(`categories/${this.selectedCateId}/attributes`, {
            attr_name: this.addForm.attr_name,
            attr_sel: this.activeTabName
          });
          if (res.meta.status !== 201) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.addDialogVisible = false;
          this.getParamsData();
        });
      },
      // 显示编辑对话框
      async showEditDialog(attr_id) {
        // 查询当前的参数信息
        const { data: res } = await this.$http.get(`categories/${this.selectedCateId}/attributes/${attr_id}`, {
          params: {attr_sel: this.activeTabName}
        });
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.editForm = res.data;
        // console.log(res.data);
        this.editDialogVisible = true;
      },
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      // 点击确认，修改参数
      editAttr() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return;
          }
          const { data: res } = await this.$http.put(`categories/${this.selectedCateId}/attributes/${this.editForm.attr_id}`,{
            attr_name: this.editForm.attr_name,
            attr_sel: this.activeTabName
          });
          if (res.meta.status !== 200) {
            return this.$message.error(res.meta.msg);
          }
          this.$message.success(res.meta.msg);
          this.getParamsData();
          this.editDialogVisible = false;
        });
      },
      async removeAttr(attr_id) {
        const confirmRes = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => {
          return error;
        });

        if (confirmRes !== 'confirm') {
          return;
        }
        const { data: res } = await this.$http.delete(`categories/${this.selectedCateId}/attributes/${attr_id}`);
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getParamsData();
      },
      // 确认新增tag
      async handleTagInputConfirm(row) {
        if (row.tagInputValue.trim().length !== 0) {
          // 由于空格用作分隔符，所以属性值不允许有空格
          row.attr_vals.push(row.tagInputValue.replace(/\s/ig,''));
        }

        this.saveAttrVals(row);
        row.tagInputValue = '';
        row.tagInputVisible = false;
      },
      // 切换成输入tag的文本框
      showTagInput(row) {
        row.tagInputVisible = true;
        // $nextTick方法：当页面元素被重新渲染之后，才会执行回调函数的代码
        this.$nextTick( _ => { // 把vue的this传递进去
          this.$refs.saveTagInput.$refs.input.focus(); // 让文本框获得焦点
        });
      },
      // 删除tag
      handleTagClose(i, row) {
        row.attr_vals.splice(i, 1);
        this.saveAttrVals(row);
      },
      // 请求保存tag
      async saveAttrVals(row) {
        const { data: res } = await this.$http.put(`categories/${this.selectedCateId}/attributes/${row.attr_id}`, {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        });

        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
      }
    },
    // 计算属性
    computed: {
      // 没有选中三级分类，两个添加按钮被禁用
      isBtnDisabled () {
        return this.selectedIds.length !== 3
      },
      // 选中三级分类的id
      selectedCateId () {
        if (this.selectedIds.length === 3) {
          return this.selectedIds[2]
        }
        return null
      },
      // 公用对话框的title
      titleText() {
        return this.activeTabName === 'many' ? '动态参数' : '静态属性';
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-cascader {
    width: 300px;
  }
  .el-tag {
    margin-right: 16px;
    margin-bottom: 8px;
  }
  .input-new-tag {
    width: 160px;
  }
</style>
