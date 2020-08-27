<template>
  <div>

    <el-card>
      <div slot="header">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>用户管理</el-breadcrumb-item>
          <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <div>
        <el-row type="flex" justify="space-between">
          <el-col :span="6">
            <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
          </el-col>
          <el-col :span="6">
            <!-- 搜索 -->
            <el-input placeholder="请输入内容" v-model="queryInfo.query"
                      @keyup.enter.native="getUserList" clearable @clear="getUserList">
              <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
            </el-input>
          </el-col>
        </el-row>

        <!-- 用户列表 -->
        <el-table :data="userList" border stripe>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column label="姓名" prop="username"></el-table-column>
          <el-table-column label="邮箱" prop="email"></el-table-column>
          <el-table-column label="电话" prop="mobile"></el-table-column>
          <el-table-column label="角色" prop="role_name"></el-table-column>
          <!-- 作用域插槽 -->
          <el-table-column label="状态">
            <template v-slot="scope">
              <!--                {{scope.row}}-->
              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
            </template>
          </el-table-column>

          <el-table-column label="操作">
            <template v-slot="scope">
              <!-- 编辑按钮 -->
              <el-tooltip effect="dark" content="编辑" placement="top" :enterable="false">
                <el-button type="primary" @click="showEditDialog(scope.row.id)" icon="el-icon-edit" size="mini"></el-button>
              </el-tooltip>

              <!-- 删除按钮 -->
              <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                <el-button type="danger"  @click="removeUserById(scope.row.id)" icon="el-icon-delete" size="mini"></el-button>
              </el-tooltip>

              <!-- 分配角色按钮 -->
              <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 8, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total">
        </el-pagination>
      </div>
    </el-card>

    <!-- 添加用户的对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="36%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" status-icon label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" clearable></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" clearable></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" clearable>
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile" clearable>
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>

      <!-- 底部按钮 -->
      <span slot="footer">
        <el-button @click="addDialogVisible = false" size="medium">取 消</el-button> <!-- false表示不显示 -->
        <el-button type="primary" @click="addUser" size="medium">确 定</el-button>
      </span>
    </el-dialog>


    <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="36%" @close="editDialogClosed">
      <!-- 编辑表单 -->
      <el-form :model="editForm" :rules="addFormRules" status-icon ref="editFormRef" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email" >
          <el-input v-model="editForm.email" clearable></el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile" >
          <el-input v-model="editForm.mobile" clearable></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer">
        <el-button @click="editDialogVisible = false" size="medium">取 消</el-button> <!-- false表示不显示 -->
        <el-button type="primary" @click="editUserInfo" size="medium">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'users',
    data () {
      return {
        // 获取用户列表的请求参数
        queryInfo: {
          query: '',
          pagenum: 1, // 当前页
          pagesize: 2 // 每页多少条数据
        },
        userList: [],
        total: 0, // 总记录数
        addDialogVisible: false, // 添加用户的对话框是否显示
        addForm: { // 添加用户的表单数据
          username: '',
          password: '',
          email: '',
          mobile: ''
        },
        addFormRules: { // 添加用户的表单的验证规则
          username: [
            { required: true, message: '用户名不能为空', trigger: 'blur' },
            { min: 3, max: 32, message: '长度在 3 到 32 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '密码不能为空', trigger: 'blur' },
            { min: 6, max: 32, message: '长度在 6 到 32 个字符', trigger: 'blur' }
          ],
          email: [
            { pattern: /^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/, message: '邮箱格式不对', trigger: 'blur' }
          ],
          mobile: [
            { pattern: /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/, message: '手机号格式不对', trigger: 'blur' }
          ]
        },
        editDialogVisible: false, // 编辑对话框是否显示
        editForm: { // 编辑表单的数据

        }
      }
    },
    created () {
      this.getUserList();
    },
    methods: {
      // 获取用户列表
      async getUserList () {
        console.log(this.queryInfo)
        const { data: res } = await this.$http.get('users', { params: this.queryInfo });
        if (res.meta.status === 200) {
          // console.log(res.data);
          this.userList = res.data.users;
          this.total = res.data.total;
        }
      },
      // 当pageSize（每页显示的条数）改变时
      handleSizeChange (newSize) {
        this.queryInfo.pagesize = newSize;
        this.getUserList();
      },
      // 当前页改变
      handleCurrentChange (newPage) {
        // console.log(newPage);
        this.queryInfo.pagenum = newPage;
        this.getUserList();
      },
      // switch状态改变
      async userStateChange (userInfo) {
        // console.log(userInfo);
        const { data: res } = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
        if (res.meta.status === 200) {
          this.$message.success(res.meta.msg);
        } else {
          this.$message.error(res.meta.msg);
          // 切换失败，重置状态
          userInfo.mg_state = !userInfo.mg_state;
        }
      },
      // 添加用户对话框的回调
      addDialogClosed() {
        this.$refs.addFormRef.resetFields();
      },
      // 添加新用户
      addUser() {
        // 表单预校验
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) {
            return;
          }

          const { data: res } = await this.$http.post('users', this.addForm);
          if (res.meta.status === 201) {
            this.$message.success(res.meta.msg);
            // 关闭对话框
            this.addDialogVisible = false;
            // 刷新用户列表
            this.getUserList();
          } else {
            this.$message.error(res.meta.msg);
          }
        });
      },
      // 显示编辑对话框
      async showEditDialog(userId) {
        const { data: res } = await this.$http.get(`users/${userId}`);
        if (res.meta.status === 200) {
          this.editForm = res.data;
          // console.log(this.editForm);
        } else {
          this.$message.error(res.meta.msg);
        }

        this.editDialogVisible = true;
      },
      // 编辑对话框关闭时，移除验证结果
      editDialogClosed() {
        this.$refs.editFormRef.resetFields();
      },
      // 请求修改用户信息
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) {
            return;
          }

          const { data: res } = await this.$http.put(`users/${this.editForm.id}`, this.editForm);
          if (res.meta.status === 200) {
            this.$message.success(res.meta.msg);
            this.editForm = res.data;
            // 关闭对话框
            this.editDialogVisible = false;
            // 刷新数据列表
            this.getUserList();
          } else {
            this.$message.error(res.meta.msg);
          }
        });
      },
      // 删除某个用户
      async removeUserById (userId) {
        const confirmRes = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => {
          return error;
        });

        if (confirmRes !== 'confirm') {
          return;
        }
        const { data: res } = await this.$http.delete(`users/${userId}`);
        if (res.meta.status === 200) {
          this.$message.success(res.meta.msg);
          this.getUserList();
        } else {
          this.$message.error(res.meta.msg);
        }
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-card {
    box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.15) !important;
  }

  .el-table {
    margin-top: 16px;
  }

  .el-pagination {
    margin-top: 16px;
    // 浮动会有问题，底部margin消失
    /*float: right;*/
    display: flex;
    justify-content: flex-end;
  }

</style>
