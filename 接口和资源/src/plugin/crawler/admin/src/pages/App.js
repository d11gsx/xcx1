import React, { useState } from "react";
import { Button } from "@strapi/design-system/Button";
import { TextInput } from "@strapi/design-system/TextInput";
import { Select, Option } from "@strapi/design-system/Select";
import { Typography } from "@strapi/design-system/Typography";

const App = () => {
  const [url, setUrl] = useState("");
  const [type, setType] = useState("posts");
  const [log, setLog] = useState("");

  const startCrawl = async () => {
    setLog("开始采集...");
    try {
      const res = await fetch(`/crawler/start?url=${encodeURIComponent(url)}&type=${type}`);
      const data = await res.json();
      setLog(JSON.stringify(data, null, 2));
    } catch (e) {
      setLog("采集失败: " + e.message);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <Typography variant="alpha">采集工具</Typography>

      <TextInput
        label="目标接口地址"
        placeholder="https://ios.htgj.xyz/api/posts"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
      />

      <Select label="类型" value={type} onChange={setType}>
        <Option value="posts">Posts</Option>
        <Option value="categories">Categories</Option>
      </Select>

      <Button onClick={startCrawl} style={{ marginTop: "16px" }}>
        开始采集
      </Button>

      <pre style={{ marginTop: "20px", background: "#f4f4f4", padding: "10px" }}>
        {log}
      </pre>
    </div>
  );
};

export default App;