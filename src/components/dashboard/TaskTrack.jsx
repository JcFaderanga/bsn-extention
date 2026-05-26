import React, { useState, useEffect, useMemo } from "react";
import { FiTrash2, FiPlus, FiChevronDown, FiChevronRight } from "react-icons/fi";

const STORAGE_KEY = "tasktrack_data";

const createItem = (type, name = "") => ({
  id: Date.now() + Math.random(),
  type,
  name,
  tags: ["FUNC"],
  count: 0,
  updatedAt: new Date(),
  collapsed: false,
  children: [],
});

const TaskTrack = ({ setSubTab }) => {
  const [data, setData] = useState([]);

  // 🔥 LOAD FROM chrome.storage
  useEffect(() => {
    if (chrome?.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setData(result[STORAGE_KEY]);
        }
      });
    }
  }, []);

  // 🔥 SAVE TO chrome.storage
  useEffect(() => {
    if (chrome?.storage) {
      chrome.storage.local.set({ [STORAGE_KEY]: data });
    }
  }, [data]);

  const updateItem = (items, id, updater) => {
    return items.map((item) => {
      if (item.id === id) return updater(item);
      if (item.children.length) {
        return { ...item, children: updateItem(item.children, id, updater) };
      }
      return item;
    });
  };

  const deleteItem = (items, id) => {
    return items
      .filter((item) => item.id !== id)
      .map((item) => ({
        ...item,
        children: deleteItem(item.children, id),
      }));
  };

  const toggleCollapse = (id) => {
    setData((prev) =>
      updateItem(prev, id, (item) => ({
        ...item,
        collapsed: !item.collapsed,
      }))
    );
  };

  const addParent = () => {
    setData((prev) => [...prev, createItem("parent", "Parent")]);
  };

  const addChild = (id) => {
    setData((prev) =>
      updateItem(prev, id, (item) => ({
        ...item,
        children: [...item.children, createItem("child", "Task Group")],
      }))
    );
  };

  const addTask = (id) => {
    setData((prev) =>
      updateItem(prev, id, (item) => ({
        ...item,
        children: [...item.children, createItem("task")],
      }))
    );
  };

  const updateName = (id, value) => {
    setData((prev) =>
      updateItem(prev, id, (item) => ({ ...item, name: value }))
    );
  };

  const updateTag = (id, index, value) => {
    setData((prev) =>
      updateItem(prev, id, (item) => {
        const newTags = [...item.tags];
        newTags[index] = value;
        return { ...item, tags: newTags };
      })
    );
  };

  const increment = (id) => {
    setData((prev) =>
      updateItem(prev, id, (item) => ({
        ...item,
        count: item.count + 1,
        updatedAt: new Date(),
      }))
    );
  };

  const decrement = (id) => {
    setData((prev) =>
      updateItem(prev, id, (item) => ({
        ...item,
        count: Math.max(0, item.count - 1),
        updatedAt: new Date(),
      }))
    );
  };

  const calculateTotals = (items) => {
    let totals = {};
    let execution = 0;

    const traverse = (list) => {
      list.forEach((item) => {
        if (item.type === "task") {
          const tag = item.tags[0] || "UNKNOWN";
          totals[tag] = (totals[tag] || 0) + item.count;
          execution += item.count;
        }
        if (item.children.length) traverse(item.children);
      });
    };

    traverse(items);
    return { totals, execution };
  };

  const overall = useMemo(() => calculateTotals(data), [data]);

  const renderTotals = (totals) => (
    <div className="flex flex-wrap gap-2">
      {Object.entries(totals).map(([key, val]) => (
        <span key={key} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
          {key}[{val}]
        </span>
      ))}
    </div>
  );

  const renderItems = (items, level = 0) => {
    return items.map((item) => (
      <div key={item.id} className={level > 0 ? "ml-2 " : ""}>

        {/* PARENT */}
        {item.type === "parent" && (
          <div className="bg-white border rounded-xl p-3 mb-2 shadow-sm">
            <div className="flex items-center gap-2">
              <button onClick={() => toggleCollapse(item.id)}>
                {item.collapsed ? <FiChevronRight /> : <FiChevronDown />}
              </button>

              <input
                value={item.name}
                onChange={(e) => updateName(item.id, e.target.value)}
                className="font-semibold outline-none border-b"
              />

              <button onClick={() => addChild(item.id)} className="ml-auto text-blue-500">
                <FiPlus />
              </button>

              <button onClick={() => setData((p) => deleteItem(p, item.id))} className="text-red-400">
                <FiTrash2 />
              </button>
            </div>

            {!item.collapsed && (
              <div className="mt-2">{renderTotals(calculateTotals([item]).totals)}</div>
            )}
          </div>
        )}

        {/* CHILD */}
        {item.type === "child" && !item.collapsed && (
          <div className="bg-white border rounded-xl px-3 py-2 mb-1 flex items-center gap-2">

            <input
              value={item.name}
              onChange={(e) => updateName(item.id, e.target.value)}
              className="outline-none border-b text-sm"
            />

            <button onClick={() => addTask(item.id)} className="ml-auto text-green-500">
              <FiPlus />
            </button>

            <button onClick={() => setData((p) => deleteItem(p, item.id))} className="text-red-400">
              <FiTrash2 />
            </button>
          </div>
        )}

        {/* TASK */}
        {item.type === "task" && (
          <div className="flex items-center gap-2 ml-8 mt-1 text-sm">
            <div className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
              {item.tags.map((tag, i) => (
                <input
                  key={i}
                  value={tag}
                  onChange={(e) => updateTag(item.id, i, e.target.value)}
                  className="w-14 text-xs bg-transparent border-b outline-none"
                />
              ))}

              <span className="font-semibold">[{item.count}]</span>

              <button onClick={() => decrement(item.id)}>-</button>
              <button onClick={() => increment(item.id)}>+</button>
            </div>

            <span className="text-xs opacity-30">
              {new Date(item.updatedAt).toLocaleTimeString()}
            </span>

            <button onClick={() => setData((p) => deleteItem(p, item.id))} className="text-red-400">
              <FiTrash2 />
            </button>
          </div>
        )}

        {/* CHILDREN RENDER */}
        {!item.collapsed && item.children.length > 0 && renderItems(item.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <button
        onClick={addParent}
        className="mt-4 mb-4 px-4 py-2 bg-blue-500 text-white rounded-xl shadow hover:bg-blue-600"
      >
        + Add Parent
      </button>

      {/* OVERALL */}
      <div className="mb-4 p-4 bg-white border rounded-xl shadow-sm">
        <div className="font-semibold text-sm mb-2">Overall Summary</div>
        {renderTotals(overall.totals)}
        <div className="text-xs mt-2">Total Execution: {overall.execution}</div>
      </div>

      {renderItems(data)}
    </div>
  );
};

export default TaskTrack;
