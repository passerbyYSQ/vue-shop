<template>
  <div>
    <el-card>
      <div slot="header">
        <!-- 面包屑导航 -->
        <el-breadcrumb separator-class="el-icon-arrow-right">
          <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
          <el-breadcrumb-item>权限管理</el-breadcrumb-item>
          <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>
      </div>
      <el-row>
        <el-col :span="4">
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>

      <!-- 角色列表区域 -->
      <el-table :data="roleList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template v-slot="scope">
            <el-row :class="['bottom-border', i1 === 0 ? 'top-border' : '', 'vertical-center']"
                    v-for="(perm1, i1) in scope.row.children" :key="perm1.id">
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, perm1.id)">{{ perm1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二级和三级权限 -->
              <el-col :span="19">
                <el-row :class="[i2 === 0 ? '' : 'top-border', 'vertical-center']" v-for="(perm2, i2) in perm1.children"
                        :key="perm2.id">
                  <!-- 二级权限 -->
                  <el-col :span="6">
                    <el-tag type="success" closable @close="removeRightById(scope.row, perm2.id)">{{ perm2.authName }}
                    </el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag type="warning" closable @close="removeRightById(scope.row, perm3.id)"
                            v-for="(perm3) in perm2.children" :key="perm3.id">
                      {{ perm3.authName }}
                    </el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
            <el-button type="warning" @click="showSetRightDialog(scope.row)" icon="el-icon-setting" size="mini">分配权限</el-button>
          </template>
        </el-table-column>

      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="36%">
      <!-- 树形控件
      这两个属性会有冲突，根据实际情况设置
       check-on-click-node :expand-on-click-node="false"
       -->
      <el-tree :data="rightsList" :props="treeProps" show-checkbox  default-expand-all check-on-click-node :expand-on-click-node="false"
               node-key="id" :default-checked-keys="defCheckedKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
    <el-button @click="setRightDialogVisible = false" size="medium">取 消</el-button>
    <el-button type="primary" @click="allotRights" size="medium">确 定</el-button>
  </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'Roles',
    data () {
      return {
        // 角色列表数据
        roleList: [],
        // 分配权限的对话框是否显示
        setRightDialogVisible: false,
        // 所有权限的数据
        rightsList: [],
        // 树形控件的配置对象
        treeProps: {
          label: 'authName', // 标签显示的内容对应数据的哪个属性
          children: 'children'
        },
        // 默认选中节点的id值数组
        defCheckedKeys: [],
        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    created () {
      this.getRoleList()
    },
    methods: {
      // 获取角色列表
      async getRoleList () {
        const { data: res } = await this.$http.get('roles')
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.roleList = res.data
          // console.log(res.data)
        }
      },
      // 根据id删除权限
      async removeRightById (role, rightId) {
        const confirmRes = await this.$confirm('此操作将删除权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(error => {
          return error
        })
        // 取消
        if (confirmRes !== 'confirm') {
          return
        }

        // console.log('确认删除');
        const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.meta.status !== 200) {
          this.$message.error(res.meta.msg)
        } else {
          this.$message.success(res.meta.msg)
          // 这样会重新渲染表格，导致权限合上
          // this.getRoleList();
          role.children = res.data
        }
      },
      // 显示分配权限的对话框
      async showSetRightDialog (role) {
        this.roleId = role.id;

        // 获取所有权限的数据
        const { data: res } = await this.$http.get('rights/tree');
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        // console.log(res.data);
        this.rightsList = res.data;
        // 获取叶子节点权限的id值
        // this.defCheckedKeys.splice(0, this.defCheckedKeys.length); // 先清空数组
        this.defCheckedKeys.length = 0;
        this.getLeafKeys(role, this.defCheckedKeys);
        // console.log(this.defCheckedKeys);
        this.setRightDialogVisible = true;
      },
      // 递归获取三级权限（叶子节点）的id值，保存到数组中
      getLeafKeys(node, arr) {
        if (!node.children) { // children属性为null，说明是叶子节点
          return arr.push(node.id);
        }
        node.children.forEach(child => {
          this.getLeafKeys(child, arr);
        });
      },
      // 点击为角色分配权限
      async allotRights() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ];
        // console.log(keys);
        const idStr = keys.join(',');
        const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr });
        if (res.meta.status !== 200) {
          return this.$message.error(res.meta.msg);
        }
        this.$message.success(res.meta.msg);
        this.getRoleList();
        this.setRightDialogVisible = false;
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .top-border {
    border-top: 1px solid #eee;
  }

  .bottom-border {
    border-bottom: 1px solid #eee;
  }

  .vertical-center {
    display: flex;
    align-items: center;
  }

</style>
