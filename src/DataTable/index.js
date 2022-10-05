import React, { useState, useEffect } from "react";
import axios from "axios";
import "antd/dist/antd.css";
import { Table, Popconfirm, Button, Space, Form, Input } from "antd";
import { isEmpty } from "lodash";

function DataTable() {
  const [gridData, setGridData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editRowKey, setEditRowKey] = useState("");
  const [form] = Form.useForm();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);

    const response = await axios.get(
      "https://jsonplaceholder.typicode.com/comments"
    );

    setGridData(response.data);
    setLoading(false);
  };

  const dataWithAge = gridData.map((item) => ({
    ...item,
    age: Math.floor(Math.random() * 6) + 20,
  }));

  const modifiedData = dataWithAge.map(({ body, ...item }) => ({
    ...item,
    key: item.id,
    message: isEmpty(body) ? item.message : body,
  }));

  const handleDelete = (value) => {
    const dataSource = [...modifiedData];
    const filterData = dataSource.filter((item) => item.id !== value.id);
    setGridData(filterData);
  };

  const isEditing = (record) => {
    return record.key === editRowKey;
  };

  const cancel = () => {};

  const save = () => {};

  const edit = (record) => {
    form.setFieldsValue({
      name: "",
      email: "",
      message: "",
      ...record,
    });
    setEditRowKey(record.key);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
    },
    {
      title: "Name",
      dataIndex: "name",
      align: "center",
      editTable: true,
    },
    {
      title: "Email",
      dataIndex: "email",
      align: "center",
      editTable: true,
    },
    {
      title: "Age",
      dataIndex: "age",
      align: "center",
      editTable: false,
    },
    {
      title: "Message",
      dataIndex: "message",
      align: "center",
      editTable: true,
    },
    {
      title: "Action",
      dataIndex: "action",
      align: "center",
      render: (_, record) => {
        const editable = isEditing(record);
        return modifiedData.length >= 1 ? (
          <Space>
            {editable ? (
              <span>
                <Space size={"middle"}>
                  <Button
                    onClick={() => {
                      save(record.key);
                    }}
                    type="primary"
                    style={{ marginRight: 8 }}
                  >
                    Save
                  </Button>
                  <Popconfirm
                    title="Are you sure you want to Cancel?"
                    onConfirm={cancel}
                  >
                    <Button>Cancel</Button>
                  </Popconfirm>
                </Space>
              </span>
            ) : (
              <Button onClick={() => edit(record)} type="primary">
                Edit
              </Button>
            )}

            <Popconfirm
              title="Are you sure you want to Delete?"
              onConfirm={() => handleDelete(record)}
            >
              <Button danger type="primary" disabled={editable}>
                Delete
              </Button>
            </Popconfirm>
          </Space>
        ) : null;
      },
    },
  ];

  const mergedColumns = columns.map((col) => {
    if (!col.editTable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    };
  });

  const editableCell = ({
    editing,
    dataIndex,
    title,
    record,
    children,
    ...restProps
  }) => {
    const input = <Input />;
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{ margin: 0 }}
            rules={[
              {
                required: true,
                message: `Please input value for ${title} field`,
              },
            ]}
          >
            {input}
          </Form.Item>
        ) : (
          children
        )}
      </td>
    );
  };

  return (
    <div>
      <Form form={form} component={false}>
        <Table
          columns={mergedColumns}
          components={{
            body: {
              cell: editableCell,
            },
          }}
          dataSource={modifiedData}
          bordered
          loading={loading}
        />
      </Form>
    </div>
  );
}

export default DataTable;
